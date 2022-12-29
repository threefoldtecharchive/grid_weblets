# weblets workflows
There are some pipliens to make sure everything work fine, here is an idea about them:

### 1 - [Build](/.github/workflows/build.yaml)
This workflow do a clean install of node dependencies, cache/restore them, build the source code using yarn `build:app`
### 2 - [CICD Docker](/.github/workflows/ci-cd-docker.yml)
