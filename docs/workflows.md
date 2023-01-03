# Weblets workflows

There are some pipliens to make sure everything work fine, here is an idea about them:

### 1 - [Build](/.github/workflows/build.yaml)

On **Pull Request**, and **Push** to development branch: It will do a clean install of node dependencies, cache/restore them to make the process faster, and build the source code using yarn `build:app`.

### 2 - [CICD Docker](/.github/workflows/ci-cd-docker.yml)

On **Push** to development branch: It will build and push a new docker image based on project release tag.

### 3 - [CICD](/.github/workflows/ci-cd.yml)

On **Push** to development branch: It will do a clean install of node dependencies, cache/restore themas in [Build](#1---build) workflow, build the source code and deploy to staging server by Copying the artifacts using ssh to `play.dev.grid.tf` .

### 4 - [Lint](/.github/workflows/lint.yaml)

On **Pull Request**, and **Push** to development branch: It will check if the code formatted well using Eslint and Prettier
