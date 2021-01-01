SHELL := /bin/bash

IMAGE_NAME=miniurl
HELM_CHART=./helm-chart
HELM_CHART_REPO=aporia-ai/helm-charts
DEFAULT_VERSION=1.0.0

# Install dependencies
install-dependencies:
	@echo [!] Installing Semver
	@sudo wget https://raw.githubusercontent.com/fsaintjacques/semver-tool/master/src/semver -O /usr/bin/semver
	@sudo chmod +x /usr/bin/semver

	@echo [!] Installing yq
	@sudo snap install yq

	@echo [!] Installing npm dependencies
	@sudo npm install

# Run tests
test:
	@echo [!] Running tests
	@npm run test

# Login to AWS registry (must have docker running)
docker-login:
	@echo [!] Logging into ECR
	@$$(aws ecr get-login --no-include-email --region $(AWS_DEFAULT_REGION))

# Build docker image
docker-build:
	@echo [!] Building Docker image with tag: $(IMAGE_NAME)
	@docker build -f Dockerfile --no-cache -t $(IMAGE_NAME) .

# Tag docker image
docker-tag:
	$(eval GIT_REVISION=$(shell git rev-parse HEAD | cut -c1-7))
	@echo [!] Tagging $(IMAGE_NAME) image with $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(GIT_REVISION)
	@docker tag $(IMAGE_NAME):latest $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(GIT_REVISION)

	$(eval VERSION=$(shell git for-each-ref --sort=-v:refname --count=1 refs/tags/[0-9]*.[0-9]*.[0-9]* refs/tags/v[0-9]*.[0-9]*.[0-9]* | cut -d / -f 3-))
	@if [ -n $(VERSION) ]; then \
		echo [!] Tagging $(IMAGE_NAME) image with $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):latest; \
		docker tag $(IMAGE_NAME):latest $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):latest; \
		echo [!] Tagging $(IMAGE_NAME) image with $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(VERSION); \
		docker tag $(IMAGE_NAME):latest $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(VERSION); \
	fi

# Push image to docker registry
docker-push:
	@echo [!] Creating ECR repo if it does not exist
	@aws ecr describe-repositories --region $(AWS_DEFAULT_REGION) --repository-names $(IMAGE_NAME) > /dev/null 2>&1 || \
		aws ecr create-repository --region $(AWS_DEFAULT_REGION) --repository-name $(IMAGE_NAME) --image-scanning-configuration scanOnPush=true

	$(eval GIT_REVISION=$(shell git rev-parse HEAD | cut -c1-7))
	@echo [!] Pushing $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(GIT_REVISION)
	@docker push $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(GIT_REVISION)

	$(eval VERSION=$(shell git for-each-ref --sort=-v:refname --count=1 refs/tags/[0-9]*.[0-9]*.[0-9]* refs/tags/v[0-9]*.[0-9]*.[0-9]* | cut -d / -f 3-))
	@if [ -n $(VERSION) ]; then \
		echo [!] Pushing $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):latest; \
		docker push $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):latest; \
		echo [!] Pushing $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(VERSION); \
		docker push $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(VERSION); \
	fi

# Build docker image and push to AWS registry
docker-build-and-push: docker-login docker-build docker-tag docker-push

# Configure helm repo
helm-configure:
	@echo [!] Adding $(HELM_CHART_REPO) helm repo
	@helm repo add --username camparibot --password $(CAMPARIBOT_TOKEN) aporia-helm-charts https://raw.githubusercontent.com/$(HELM_CHART_REPO)/master

# Push chart to helm repository
helm-push:
	@echo [!] Packaging helm chart
	@helm package $(HELM_CHART) --dependency-update

	$(eval PACKAGE_FILENAME=$(shell helm show chart $(HELM_CHART) | yq r - 'name')-$(shell helm show chart $(HELM_CHART) | yq r - 'version').tgz)

	@echo [!] Pushing helm chart to repo
	@rm -rf /tmp/helm-charts && \
		git clone https://camparibot:$(CAMPARIBOT_TOKEN)@github.com/$(HELM_CHART_REPO).git /tmp/helm-charts && \
		mv $(PACKAGE_FILENAME) /tmp/helm-charts
		cd /tmp/helm-charts && \
		helm repo index . && \
		git add index.yaml $(PACKAGE_FILENAME) && \
		git commit -m "$(IMAGE_NAME) $(shell helm show chart $(HELM_CHART) | yq r - 'version')" && \
		git push

# Bump version
bump-version:
	$(eval CURRENT_VERSION=$(shell git for-each-ref --sort=-v:refname --count=1 refs/tags/[0-9]*.[0-9]*.[0-9]* refs/tags/v[0-9]*.[0-9]*.[0-9]* | cut -d / -f 3-))
	$(eval NEW_VERSION=v$(shell \
		if [ -z $(CURRENT_VERSION) ]; then \
			echo $(DEFAULT_VERSION); \
		else \
			semver bump patch $(CURRENT_VERSION); \
		fi; \
	))

	@git log -1 --pretty="%B" > /tmp/commit-message
	@sed -i '1s/^/\[$(NEW_VERSION)] /' /tmp/commit-message

	@echo [!] Bumping version from $(CURRENT_VERSION) to $(NEW_VERSION)

	@poetry version $(NEW_VERSION) || true
	@git add pyproject.toml || true

	yq w -i $(HELM_CHART)/Chart.yaml version $(NEW_VERSION)
	yq w -i $(HELM_CHART)/values.yaml container.image $(AWS_ECR_ACCOUNT_URL)/$(IMAGE_NAME):$(NEW_VERSION)

	git add $(HELM_CHART)/Chart.yaml $(HELM_CHART)/values.yaml
	git commit -F /tmp/commit-message --amend --no-edit

	git tag -a -m "Version $(NEW_VERSION)" $(NEW_VERSION)

	@BRANCH_PROTECTION=`curl https://api.github.com/repos/$(GITHUB_REPOSITORY)/branches/master/protection \
		-H "Authorization: token $(CAMPARIBOT_TOKEN)" -H "Accept:application/vnd.github.luke-cage-preview+json" -X GET -s`; \
	if [ "`echo $$BRANCH_PROTECTION | jq -r '.message'`" != "Branch not protected" ]; \
	then \
		echo [!] Disabling GitHub master branch protection; \
		curl https://api.github.com/repos/$(GITHUB_REPOSITORY)/branches/master/protection \
			-H "Authorization: token $(CAMPARIBOT_TOKEN)" -H "Accept:application/vnd.github.luke-cage-preview+json" -X DELETE; \
		trap '\
			echo [!] Re-enabling GitHub master branch protection; \
			curl https://api.github.com/repos/$(GITHUB_REPOSITORY)/branches/master/protection -H "Authorization: token $(CAMPARIBOT_TOKEN)" \
				-H "Accept:application/vnd.github.luke-cage-preview+json" -X PUT -d "{\"required_status_checks\":{\"strict\":false,\"contexts\":`echo $$BRANCH_PROTECTION | jq '.required_status_checks.contexts'`},\"restrictions\":{\"users\":[],\"teams\":[],\"apps\":[]},\"required_pull_request_reviews\":{\"dismiss_stale_reviews\":false,\"require_code_owner_reviews\":false},\"enforce_admins\":true,\"required_linear_history\":false,\"allow_force_pushes\":true,\"allow_deletions\":false}"; \
		' EXIT; \
	fi; \
	echo [!] Git Push; \
	git push --force;

	echo "::set-output name=bumped_version_commit_hash::`git log --pretty=format:'%H' -n 1`";

# Build docker image and install helm chart
deploy: docker-build-and-push helm-configure helm-push
