# Weblets workflows

There are some pipliens to make sure everything work fine, here is an idea about them:

### 1 - [Build](/.github/workflows/build.yaml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using yarn `build:app`.

### 2 - [CICD Docker](/.github/workflows/ci-cd-docker.yml)

On **Push** to development branch, and on **Release** published: It will build and push a new docker image based on project release tag.<br>
We are using _VERSION_, and _NETWORK_ arguments in this workflow that will be propagated into the builds [config](https://github.com/threefoldtech/grid_weblets/blob/development/webpack.config.js#L72), The values of those arguments could be as follows:

````js
NETWORK = "dev" | "qa" | "test" | "main" (default: dev)
VERSION = "any valid string"
````
> NOTE: In case of release, the _NETWORK_ value follows the tag type by default, e.g. if the release tag contains qa so the _NETWORK_ will be `"qa"` as well, also`"dev"` only works with **PUSH** to the development branch. Check [Releasing](./releasing.md#tags-type-based-on-network) section for more details about tag types

### 3 - [CICD](/.github/workflows/ci-cd.yml)

On **Push** to development branch: It will do a clean install of node dependencies, cache/restore themas in [Build](#1---build) workflow, build the source code and deploy to staging server by Copying the artifacts using ssh to `play.dev.grid.tf` .

### 4 - [Lint](/.github/workflows/lint.yaml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint and Prettier
