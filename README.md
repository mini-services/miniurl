# MiniUrl

## Introduction

MiniUrl is an open-source production-ready microservice for shortening Urls. Deploy it on your personal cloud and get a fully-functional url-shortener with zero effort.

MiniUrl is part of the [Mini Services Project](https://github.com/mini-services).

**Features**

-   Extremely efficient
-   Production ready
-   Zero code
-   Easy setup
-   Highly configurable
-   Cloud-ready with an almost zero-config Helm chart
-   Multiple deployment options

## Getting Started

-   Run using [Helm](https://github.com/mini-services/miniurl/tree/main#helm), [Docker](https://github.com/mini-services/miniurl/tree/main#docker) or [Node.js](https://github.com/mini-services/miniurl/tree/main#nodejs)
- Use the API (future: dashboard) and enjoy a zero-code microservice :upside_down_face:
## Deployment Options

### Helm
MiniUrl maintains an extensive production-grade Helm chart. See the [chart](https://github.com/mini-services/miniurl/tree/main/helm-chart) for the possible values configuration and examples.

```s
helm repo add miniservices https://raw.githubusercontent.com/mini-services/helm-charts/main
helm repo update

# You may also add --set ingress.enable=true for deploying an Ingress route as well
helm upgrade --install miniurl miniservices/miniurl --set baseRedirectUrl=https://short.url
```

### Docker
Run MiniUrl's docker image directly. 
```s
docker run -d --name miniurl -e BASE_REDIRECT_URL=https://short.url -e STORAGE_DRIVER=InMemory -p 80:8000 miniservices/miniurl
```

**NOTE** this deployment is NOT production ready since it uses the InMemory storage driver which is a plain object. To run a production-grade docker deployment, you will need to provide a suitable database. A working example using Postgres:
```s
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
docker run -d --name miniurl -p 80:8000 miniservices/miniurl \
                             -e BASE_REDIRECT_URL=https://short.url \
                             -e STORAGE_DRIVER=Relational \
                             -e RELATIONAL_STORAGE_CLIENT=postgres \
                             -e RELATIONAL_STORAGE_HOST=localhost:5432 \
                             -e RELATIONAL_STORAGE_USER=postgres \
                             -e RELATIONAL_STORAGE_PASSWORD=postgres
```

### Node.js
```s
git clone https://github.com/mini-services/miniurl.git
cd miniurl
npm install
npx cross-env BASE_REDIRECT_URL=https://short.url STORAGE_DRIVER=InMemory npm start
```

**NOTE** this deployment is NOT production ready since it uses the InMemory storage driver which is a plain object. To run a production-grade docker deployment, you will need to provide a suitable databases (and possibly a process manager such as [pm2](https://github.com/Unitech/pm2)). A working example assuming a Postgres database on `localhost:5432` with username `postgres` and password `postgres`:

```s

npx cross-env BASE_REDIRECT_URL=https://short.url \
              STORAGE_DRIVER=Relational \
              RELATIONAL_STORAGE_CLIENT=postgres \
              RELATIONAL_STORAGE_HOST=localhost:5432 \
              RELATIONAL_STORAGE_USER=postgres \
              RELATIONAL_STORAGE_PASSWORD=postgres \
              npm start
```
## API

The easiest way to get familiar with MiniUrl's API is using [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/).

**Insomnia**

-   [MiniUrl workspace](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/insomnia.json)

**Postman**

-   [Url collection](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/url-collection.json)
-   [Demo environment](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/demo-environment.json)
-   [Local environment](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/local-environment.json)


### POST /miniurl/url

Save a url and get a shorter one instead.

#### Request

Body (json)

-   `url: string` (required) - The url to shorten

#### Response

Body (text) - a shortened Url

### GET /miniurl/url/:id

Retrieves a saved url with its information.

#### Request

Query

-   `id: string` (required) - The saved url's id

#### Response

Body (json)

-   `id: string` - The url's id
-   `url: string` - The saved url
-   `createdAt: string` - an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date indicating the creation time
-   `updatedAt: string` - an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date indicating the last updated time

### GET _{{ baseRedirectUrl }}_/:id

Redirects to a saved url.

**NOTE** this endpoint may not be found at the root url since it depends on the baseRedirectUrl configuration variable. e.g if the baseRedirectUrl is `localhost:3000/u`, this endpoint will be found at `/u/:id`.

#### Request

Query

-   `id: string` (required) - The saved url's id

#### Response

Redirect 302 - redirects to the saved url.

## Configuration

**BASE_REDIRECT_URL** - the shortened urls base path e.g https://youtu.be, https://bit.ly or https://example.com/u

**URL_MATCH_PATTERN** - a [micromatch](https://github.com/micromatch/micromatch)-complaint glob pattern for restricting the saved urls (for example, if you don't want your MiniUrl to save links other than your domain such as https://evil-fisching.com)

**URL_LIFETIME** - a human-readible time (see the [ms docs](https://github.com/vercel/ms) for available options) stating the url lifetime (after which it expires). Note that the expiration mechanism runs at most once per minute and at least once per hour and so slight deviation may occur.

**STORAGE_DRIVER** - the url storage driver. available options are `InMemory` (for development purposes only) and `Relational` (any Knex-complaint SQL database).

**RELATIONAL_STORAGE_CLIENT** - the relational client to use, see [Knex docs](http://knexjs.org/) for the available options

**RELATIONAL_STORAGE_HOST** - the relational database's host (e.g https://my-database.com:5432)

**RELATIONAL_STORAGE_USER** - the relational database's username

**RELATIONAL_STORAGE_PASSWORD** - the relational database's password

**RELATIONAL_STORAGE_DATABASE** - the relational database's name (e.g postgres)

**PORT** - the Node.js process port. In most cases your shouldn't change this

## Issues and Questions

### Issues & Features

If you found a bug or have an idea for a feature, feel free to [open an issue](https://github.com/mini-services/miniurl/issues/new/choose).

### Questions

You may [open an issue](https://github.com/mini-services/miniurl/issues/new/choose) for questions, but it's usually faster to send a message on our [Slack](https://join.slack.com/t/mini-services/shared_invite/zt-kkr2n6nl-AlboXMQO~~atqUM2Wd0oPg)

## Contribution

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Snir Shechter
