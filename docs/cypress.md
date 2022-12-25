## Cypress

### Prerequisites

- Check the System Requirements first from the [Cypress Docs](https://docs.cypress.io/guides/getting-started/installing-cypress#System-requirements).

## Running Cypress

- You can run cypress using two different methods either through the [cypress test runner (Headed Mode)](https://docs.cypress.io/guides/getting-started/opening-the-app#cypress-open) or through [Command Line (Headless Mode)](https://docs.cypress.io/guides/guides/command-line#What-you-ll-learn)

### Credentials

- Before running any tests navigate to `/cypress/fixtures/credntials.json` and add your `Mnemonics` and `Public SSH Key`

### Cypress Test Runner

- To run Cypress using the test runner you can follow the instructions in the [docs](https://docs.cypress.io/guides/getting-started/opening-the-app#cypress-open) or use any of the following commands.

- `npx cypress open`
- `yarn run cypress open`

- This will open the test runner and then you can choose between the testing type

  ![image](https://user-images.githubusercontent.com/101194226/173856212-2833f7e2-48cc-4dc3-8ede-205f57087260.png)

- If you choose e2e testing you will be prompted again to choose the preferred browser.

  ![image](https://user-images.githubusercontent.com/101194226/173856643-5a1c234c-941a-4ac3-883a-b9a8e71a5d50.png)

- After choosing the browser cypress will open the test runner and automatically detect spec files available in `cypress/e2e`

  ![image](https://user-images.githubusercontent.com/101194226/173857152-b0aedfb0-af21-4b8c-afef-ff924d31fb33.png)

- You can run the tests by simply clicking on the spec file for the test.

### Command Line

- To run cypress using headless mode you can follow the instructions in the [docs](https://docs.cypress.io/guides/guides/command-line#What-you-ll-learn) or use any of the following commands.
- `npx cypress run`
- `yarn cypress run`
- The previous commands will run all the tests but if you want to run a single test you can use any of the following commands
- `npm run cy:run -- --record --spec "cypress/e2e/my-spec.cy.js"`
- `npx cypress run --record --spec "cypress/e2e/my-spec.cy.js"`
- You can also check all the options that can be added to the `cypress run` command from [here](https://docs.cypress.io/guides/guides/command-line#cypress-run).
- After executing any of these commands cypress will run and log everything in the console.
