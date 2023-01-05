# Configure the editor/IDE

We recommend [Visual Studio Code](https://code.visualstudio.com/) as it has many extensions that will help, there are some of them:

- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Svelte 3 Snippets](https://marketplace.visualstudio.com/items?itemName=fivethree.vscode-svelte-snippets)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  Configuration file: 
  - `grid_weblets/.eslinttrc.js`
  
    ````js
    module.exports = {
        env: {
        browser: true,
        es2021: true,
        node: true,
        },
        parser: "@typescript-eslint/parser",
        plugins: ["svelte3", "@typescript-eslint"],
        extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:cypress/recommended", "prettier"],
        overrides: [
        {
            files: ["*.svelte"],
            processor: "svelte3/svelte3",
        },
        ],
        parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        },
        rules: { "@typescript-eslint/no-explicit-any": "off" },
        settings: {
        "svelte3/typescript": true, // load TypeScript as peer dependency
        }
    }
    ````

  - `grid_weblets/.eslintignore`

    ````js
    # /node_modules/* and /bower_components/* in the project root are ignored by default

    # Ignore built files except build/index.js

    playground/public/build/elements/*
    *.config.*
    *global.css
    ````

- [Vue Language Features](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
