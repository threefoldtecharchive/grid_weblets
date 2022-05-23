## Prerequests

- Make sure you go through the [getting started](./getting_started.md) guide first.
- Have some knowledge of [Typescript](https://www.typescriptlang.org/docs/) and [Svelte](https://svelte.dev/docs).

## Write a Weblet

We are going to add new weblet called `demo` .

1. Add new folder called **demo** at `src/elements/demo` .
2. Add **Demo.wc.svelte** at `src/elements/demo/Demo.wc.svelte` .

   ```ts
   // Demo.wc.svelte

   /* Write whatever svelte code u need here */
   ```

3. Add **index.ts** at `src/elements/demo/index.ts` .

   ```ts
   // index.ts

   import "./Demo.wc.svelte";
   ```

4. Developing weblet by importing `Demo.wc.svelte` into `App.svelte`.

   ```html
   <!-- App.svelte -->
   <script lang="ts">
     import Demo from "./elements/demo/Demo.wc.svelte";
   </script>

   <Demo />
   ```

5. Build `Demo.wc.svelte`.

    ```sh
    yarn build
    ```

    Find the output in the `.build/` directory.

## Add Weblet To Plain HTML File

Assume we need to include `vm` weblet in its own `index.html` file.  
Notes:

1. You will need to include `base.wc.js` & `profiles.wc.js` for every component to work.
2. Also, You will need to inject the required libraries [grid3_client](https://www.npmjs.com/package/grid3_client) and [ts-rmb-http-client](https://www.npmjs.com/package/ts-rmb-http-client) in `window.configs` Object.

The `index.html` file should be like the following.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VM Weblet Example</title>

    <style>
      * {
        box-sizing: border-box;
      }
    </style>

    <!-- window.configs should include the required libs -->
    <script src="/path/to/libs/to/inject"></script>

    <!-- include the components -->
    <script src="/path/to/base.wc.js"></script>
    <script src="/path/to/profiles.wc.js"></script>
    <script defer src="/path/to/vm.wc.js"></script>
  </head>
  <body>
    <!-- Base, Profile and your desired weblet -->
    <tf-base></tf-base>
    <tf-profiles></tf-profiles>
    <tf-vm></tf-vm>
  </body>
</html>
```

## Add Weblet to The Playground
1. Deploy the weblet in the playground app by appending the weblet to the elements list in `playground/src/App.vue`
2. Create new tab in the sideNav by appending the weblet list with new class of `Weblet` in `playground/src/views/Editor.vue`

