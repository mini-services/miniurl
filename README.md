# v0.1.0

#### Basic

-   [x] Graceful shutdown
-   [x] The user should be able to define the storage driver and connection (env vars + config + helm chart)
-   [x] in-memory driver (for development)
-   [x] postgres driver

#### Tests

-   [ ] unit: services, routes
-   [ ] test the graceful shutdown on kubernetes (does it work?)
-   [ ] e2e: all endpoints, with deploy, without deploy, InMemory, Relational

#### Community

-   [ ] Demo (Digital Ocean)
-   [ ] README
-   [ ] Export an Insomnia file

#### DevSecOps

-   [x] GitGuardian, dependabot
-   [x] Dockerfile
-   [x] Helm chart
-   [ ] Helm chart - add the real image (after the CI/CD deploys it), ingress route should also take into account the path & port of baseRedirectUrl (not just host)
-   [ ] upload docker image to dockerhub, upload helm chart to helm hub (Artifact hub) and Github (our own separate helm repo)
-   [x] Allow to deploy with its own DB (helm chart should create a Postgres/redis/mongodb if no connection creds are given)
-   [ ] Deployment CI/CD : run tests, build & push docker image, build & push helm, deploy docs & demo
-   [ ] Find a suitable name for the project and change it
-   [ ] Code Climate

#### Advanced features

-   [x] The microservice should wait for the storage driver (postgres) connection to be live and not crash if it doesn't respond initially
-   [x] Add saved url restrictions (e.g only save urls from google.com or my domain, don't save urls with certain query params etc.)
-   [x] URL cleanup (cleanup urls created over X time ago) - use some scheduler (k8s CronJobs? what happens if it's deployed outside k8s? prefer in-code scheduler)

# v0.2.0

#### Admin

-   [x] Create an auth service with a Bearer driver
-   [ ] Implement the auth bearer driver (just get the admin secret from env as config and check it on any admin endpoints)
-   [ ] Url delete endpoint (admin)
-   [ ] Record every url retrieve/redirect to admin
-   [ ] destroy app (admin) - allow the user to clean up since we might be using shared resources (database, etc.) - delete everything from the database and shutdown (removing a self-deployed database will be performed via `helm uninstall`)
-   [ ] enable custom ids (e.g http://url.sh/my-nice-link)

#### Features

-   [ ] Url info endpoint - used with a plus sign (?) (my-url.com/sOm3Id+), admins get more info
-   [ ] URL cleanup - use "last used at" instead of "updated at" timestamp, allow for soft cleanup (use deleted_at instead of deleting the row) for info for admins later on
-   [ ] fs driver

#### Chores

-   [ ] swap all console uses in pino (fastify.log)

#### Community

-   [ ] PR template
-   [ ] Issue template(s) - see the Node.js repo for a good example
-   [ ] Github Roadmap/Projects
-   [ ] Github discussions
-   [ ] "Marketing" website
-   [ ] Docs (Vuepress?) - should have a guide section and a technical API section
-   [ ] Export a Postman file

# v1.0.0

-   [ ] Design a live config implementation - how do we update the config live AND keep it up-to-date with other instances and the codebase config?
-   [ ] Implement the config CRUD get, set, edit (admin)
-   [ ] dashboard (admin)
-   [ ] Auth service - basic auth driver
-   [ ] mongodb driver
-   [ ] redis driver
-   [ ] relational driver should support all other relational databases (mySQL, SQLite, etc.)
-   [ ] Export a Postman file
-   [ ] Storage: dynamically import the drivers (on docker: prebuild many images e.g miniurl-redis, miniurl-postgres etc?)
-   [ ] Buy a custom domain

# Future

-   [ ] Allow for issuing signed signatures
-   [ ] Publish as a plugin NPM package with programmatic usage, also suitable as Fastify & Express plugins
-   [ ] RBAC - allow links to be related to certain users/groups/roles via headers/auth and used only by them
-   [ ] Extract a template out of this repo (for future repos)
-   [ ] Separate Makefile to multiple files - helm makefile, docker makefile etc.

## Development

##### Installing

-   `docker build -t miniurl .`
-   `helm install miniurl ./helm-chart --set ingress.enable=true --set imagePullPolicy=IfNotPresent`

##### Uninstalling

-   `helm uninstall miniurl`
-   `kubectl delete pvc data-miniurl-postgresql-0`

##### Up Postgres (if not deploying via helm)

-   `docker run -d --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
