# Grid Weblets

![Version: 1.0.0](https://img.shields.io/github/v/release/threefoldtech/grid_weblets)
[![CI-CD](https://github.com/threefoldtech/grid_weblets/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/threefoldtech/grid_weblets/actions/workflows/ci-cd.yml)
[![Cypress Tests](https://github.com/threefoldtech/grid_weblets/actions/workflows/test.yaml/badge.svg)](https://github.com/threefoldtech/grid_weblets/actions/workflows/test.yaml)

## Introduction

Weblets is a front-end application that helps with deploying solutions on TF Grid v3. A weblet is a compiled javascript web component which can be embedded in HTML page of a web app. The backend for the weblets is introduced with [grid client](https://manual.grid.tf/javascript/grid3_javascript_readme.html) which communicate to TF Chain and TF Grid over RMB.

Weblets is a svelte project for creating web components - which are reusable custom elements with their functionality encapsulated away from the rest of the code — that interact with TF Grid 3 and could be utilized from other web apps.
It solves such problem where you had to write complex HTML (and associated style and script) to render custom UI controls (eg, to deploy some workload on the TF Grid 3), and how using them multiple times in different projects can be a miss if you are not careful.

## Installation

- **Prerequisite**

  - Nodejs 16^
  - yarn
  - libtool

  > For troubleshooting please checkout this file [troubleshooting](./docs/config.md)

- **Clone the repository**

  ```bash
  git clone https://github.com/threefoldtech/grid_weblets.git
  ```

## Getting Started

> For detailed information you can read the [Getting Started](./docs/getting_started.md) documentation.

Before running the Weblets, in your terminal move to the project directory, then install the required dependencies using `yarn deps`, it runs [install_deps.sh](./scripts/install_deps.sh), that will handle the installation of Weblets and playground dependencies

```bash
cd grid_weblets
yarn deps
```

- **Run Weblets in Development mode**

```bash
yarn serve:app
```

- **Run Weblets in Production mode**

```bash
yarn build:app
```

This will generate the production build in the `dist` directory, which can be served using [Caddy](https://caddyserver.com/) or [NGINX](https://www.nginx.com/)

You can run the playground in different modes. by editing the config file in `playground/public/config.js`
For an automated generation of the config file you can use the script `build-env` in `scripts/` it will generate the config file based on your env-vars.

```bash
cd playground/public
bash ../../scripts/build-env.sh
```

More illustration on the build-env script [here](docs/build.md)

## Testing

The main testing tool that is used in Weblets is [Cypress](https://www.cypress.io/).

- [How to run tests](./docs/cypress.md)
- [How to write new tests](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test)

## Related Documentations

- [Configure the editor/IDE](./docs/editor_config.md)
- [Contributing Guide](./docs/contributing.md)
- [Weblets documentation](https://manual.grid.tf/weblets/weblets_profile_manager.html?highlight=profile#profile-manager)
- [Troubleshooting](./docs/config.md)
- [Pipelines documentation](./docs/workflows.md)
- [Releasing process](./docs/releasing.md)
