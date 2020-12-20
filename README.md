## Endpoints

### url

-   delete (admin)
-   info - with a plus sign (/000001+), admins get more info

### config

-   get (admin)
-   set (admin)
-   edit (admin)
-   dashboard (admin)

### admin

-   destroy (admin) - allow the user to clean up since we might be using shared resources (database, etc.)

## Services

### auth

-   [x] bearer driver

### store

-   [x] in-memory driver (for development)
-   [x] postgres driver

## Tests

-   [ ] unit: services, routes
-   [ ] e2e: all endpoints, with deploy, without deploy, InMemory, Relational

## Devops

-   [ ] Demo (Digital Ocean)
-   [ ] README
-   [ ] Export Insomnia file
-   [ ] PRs: PR template, run tests, GitGuardian, dependabot
-   [x] Dockerfile
-   [x] Helm chart
-   [ ] Helm chart - fix examples, add the real image
-   [ ] upload docker image to dockerhub
-   [x] Allow to deploy with its own DB (helm chart should create a Postgres/redis/mongodb if no connection creds are given)
-   [ ] Deployment: run tests, build docker, build helm, deploy to demo
-   [ ] The helm chart should wait for the postgres to be live and not crash if it doesn't respond initially (possibly schedule another test later on)

## Features

-   [x] The user should be able to define the storage driver and connection (env vars + config + helm chart)
-   Docs
-   Record every url retrieve/redirect to admin
-   [ ] URL cleanup (with a threshold)
-   [ ] Add saved url restrictions (e.g only save urls from google.com etc.)
-   [x] Graceful shutdown
-   mongodb driver
-   redis driver
-   fs driver
-   Export a Postman file
-   Storage: dynamically import the drivers (prebuilt docker images? )

## Development

`helm install miniurl ./helm-chart --set ingress.enable=true --set imagePullPolicy=IfNotPresent`
`helm uninstall miniurl`
`kubectl delete pvc data-miniurl-postgresql-0`
`docker run -d --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
