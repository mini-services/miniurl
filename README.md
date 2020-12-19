## Endpoints

### url

-   delete (admin)
-   info - with a plus sign (/000001+), admins get more info

### config

-   get (admin)
-   set (admin)
-   edit (admin)
-   dashboard (admin)

## admin

-   destroy (admin) - allow the user to clean up since we might be using shared resources (database, etc.)

## Services

### auth

-   [x] bearer driver

### store

-   [x] in-memory driver (for development)
-   [x] postgres driver

## Tests

-   [] unit: services, routes
-   [] e2e: all endpoints

## Devops

-   [] Demo (Digital Ocean)
-   [] README
-   [] Export Insomnia file
-   [] PRs: PR template, run tests, GitGuardian, dependabot
-   [x] Dockerfile
-   [] WIP Helm chart (needs testing)
-   [] Allow to deploy with its own DB (helm chart should create a Postgres/redis/mongodb if no connection creds are given)
-   [] Deployment: run tests, build docker, build helm, deploy to demo

## Features

-   [] The user should be able to define the storage driver and connection (env vars + config + helm chart)
-   Docs
-   Record every url retrieve/redirect to admin
-   [] URL cleanup (with a threshold)
-   [] Add saved url restrictions (e.g only save urls from google.com etc.)
-   mongodb driver
-   redis driver
-   fs driver
-   Export a Postman file
-   Storage: dynamically import the drivers (prebuilt docker images? )

## Development

`docker run -d --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
