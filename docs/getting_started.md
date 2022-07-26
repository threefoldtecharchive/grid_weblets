## Weblets project

Weblets are a web components which provide a UI to deploy workloads on TF Grid 3. all the backend functionality is provided by [grid_client](https://github.com/threefoldtech/grid3_client_ts). It is a reusable component that can be injected in a HTML or a Node Web app.

## Repo structure

The repo contains two projects:

- The weblets itself as the components.
  - which written in `Svelte`
  - available in the `/` directory.
- The playground as a web app where you can try out the weblets.
  - which written in `Vue`
  - available in the `/playground` directory.

## Usage

You can use one of the live instances of the playground:

- dev environment: rapidly changing environment on development branch merges: https://play.dev.grid.tf
- qa environment: more stable environment on pre-releases: https://play.qa.grid.tf
- test environment: more stable environment on pre-releases: https://play.test.grid.tf
- stable environment: most stable / verified code, based on releases: https://play.grid.tf

Or run the playground locally:
First you need to [Install dependencies and config the environment](./config.md)

Then, to run the playground you need to first build the weblets then move the built files to the `/playground` directory. to serve it. and this can be done with `yarn serve:app` script.

```bash
yarn deps           # to install the dependencies
yarn serve:app      # to build, move, and serve the playground
```

For targeted build you can export the `TARGET_WEBLETS` environment variable to build only the weblets you want. the value is the name of the folder in `src/elements/` directory seperated by space. for example:

```bash
export TARGET_WEBLETS="vm peertube DeployedList"
yarn serve:app
```

To read about each weblet and how to use it, and also how to config your twin id and activate your profile on the playground you can go to the [weblets documentation](https://library.threefold.me/info/manual/#/manual__weblets_profile_manager).

## Weblet List

There is a several component in the weblets repo, you can find them in the `/src/elements` directory. and they are:

- Basic Components
  - [Micro Virtual Machine](/src/elements/vm)
  - [Kubernetes Cluster](/src/elements/kubernetes)
- Comunity Solutions
  - [Caprover](/src/elements/caprover)
  - [Peertube](/src/elements/peertube)
  - [Funkwhale](/src/elements/funkwhale)
  - [Mattermost](/src/elements/Mattermost)
  - [Discourse](/src/elements/discourse)
  - [Taiga](/src/elements/taiga)
  - [Owncloud](/src/elements/owncloud)
  - [Presearch](/src/elements/presearch)
  - [Casperlabs](/src/elements/casperlabs)
  - [Node Pilot](/src/elements/nodePilot)
  - [Full Virtual Machine](/src/elements/fullvm)
- Utils Components
  - [Base](/src/elements/base)
  - [Profile](/src/elements/profiles)
  - [Deployments List](/src/elements/DeployedList)
  - [Contracts List](/src/elements/ContractsList)
  - ...
