## Endpoints

### url

-   delete (admin)
-   info - with a plus sign (/000001+), admins get more info

### config

-   get (admin)
-   set (admin)
-   edit (admin)
-   dashboard (admin)

## Services

### auth

-   [x] bearer driver

### store

-   [x] in-memory driver (development)
-   WIP postgres driver

## Tests

-   unit: services, routes
-   e2e: all endpoints

## Devops

-   Demo (Kubesail for a kubernetes namespace?)
-   Docs + README + Export Insomnia file
-   PRs: PR template, run tests, GitGuardian, dependabot
-   Deployment: run tests, build docker, build helm, deploy to demo

## Features

-   Record every url retrieve/redirect to admin
-   URL cleanup (with a threshold)
-   Add saved url restrictions (e.g only save urls from google.com etc.)
-   Allow to deploy with its own DB (helm chart should create a Postgres/redis/mongodb if no connection creds are given)
-   mongodb driver
-   redis driver
-   fs driver
