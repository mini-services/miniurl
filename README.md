# MiniUrl

## Introduction

MiniUrl is an open-source production-ready microservice for shortening Urls. Deploy it on your personal cloud and get a fully-functional url-shortener with zero effort.

MiniUrl is part of the [Mini Services Project](https://github.com/mini-services).

**Features**

-   Extremely efficient
-   Production ready
-   Easy setup
-   Cloud-ready with an almost zero-config Helm chart
-   Multiple deployment options

## Getting Started

## Installation Options

## API

The easiest way to get familiar with MiniUrl's API is using [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/).

**Insomnia**

-   [MiniUrl workspace](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/insomnia.json)

**Postman**

-   [Url collection](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/url-collection.json)
-   [Demo environment](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/demo-environment.json)
-   [Local environment](https://raw.githubusercontent.com/mini-services/miniurl/main/docs/assets/postman/local-environment.json)

### Specification

#### **POST** /miniurl/url

Save a url and get a shorter one instead.

##### Request

Body (json)

-   `url: string` (required) - The url to shorten

##### Response

Body (text) - a shortened Url

#### **GET** /miniurl/url/:id

Retrieves a saved url with its information.

##### Request

Query

-   `id: string` (required) - The saved url's id

##### Response

Body (json)

-   `id: string` - The url's id
-   `url: string` - The saved url
-   `createdAt: string` - an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date indicating the creation time
-   `updatedAt: string` - an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date indicating the last updated time

#### GET _{{ baseRedirectUrl }}_/:id

Redirects to a saved url.

**NOTE** this endpoint may not be found at the root url since it depends on the baseRedirectUrl configuration variable. e.g if the baseRedirectUrl is `localhost:3000/u`, this endpoint will be found at `/u/:id`.

##### Request

Query

-   `id: string` (required) - The saved url's id

##### Response

Redirect 302 - redirects to the saved url.

## Configuration

## Uninstallation

## Issues and Questions

### Issues & Features

If you found a bug or have an idea for a feature, feel free to [open an issue](https://github.com/mini-services/miniurl/issues/new/choose).

## Questions

You may [open an issue](https://github.com/mini-services/miniurl/issues/new/choose) for questions, but it's usually faster to send a message on our [Slack](https://join.slack.com/t/mini-services/shared_invite/zt-kkr2n6nl-AlboXMQO~~atqUM2Wd0oPg)

## Contribution

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Snir Shechter
