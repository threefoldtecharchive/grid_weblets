# Grid Weblets
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-informational?style=flat-square)

A svelte project for creating web components that should be used every where else.

## Contents
- Elements
    - [K8S](#kubernetes)
    - [VM](#virtual-machine)
    - [Caprover](#caprover)
    - [Deployed List](#deployed-list)
- [Add New Weblet](#add-new-weblet)


### Kubernetes
```html
<tf-kubernetes></tf-kubernetes>
```
![image](https://user-images.githubusercontent.com/31689104/140759704-983816c3-2a01-4da8-90bb-fee3f9928f7e.png)

### Virtual Machine
```html
<tf-vm></tf-vm>
```
![image](https://user-images.githubusercontent.com/31689104/140759788-c9403c04-2d83-493f-9124-2af191b82a4a.png)

### Caprover
```html
<tf-caprover></tf-caprover>
```
![image](https://user-images.githubusercontent.com/31689104/140759852-e056e5bb-bcc7-4096-9b7c-7110afc05284.png)

### Caprover
```html
<tf-deployedlist></tf-deployedlist> <!-- to show all tabs -->
<!-- Accept tab attribute      tab =  'vm' | 'k8s' | 'caprover' -->
<tf-deployedlist tab="k8s"></tf-deployedlist>
<tf-deployedlist tab="vm"></tf-deployedlist>
<tf-deployedlist tab="caprover"></tf-deployedlist>
```
![image](https://user-images.githubusercontent.com/31689104/140760029-634e5e14-ac83-4caf-ad3e-75c66edbdf18.png)
![image](https://user-images.githubusercontent.com/31689104/140760540-a0475e07-14d7-4daa-a728-5babf32bc8d4.png)


### Add New Weblet
We are going to add new weblet called `demo` .

1. Add new folder called **demo** at `src/elements/demo` .
2. Add **Demo.wc.svelte** at `src/elements/demo/Demo.wc.svelte` .
3. Add **index.ts** at `src/elements/demo/index.ts` .

```ts
// index.ts

// import *demo* component
import Demo from './Demo.wc.svelte';

// import *defineElement* library
import defineElement from '../../utils/defineElement';


// Register new wc
defineElement('demo', Demo); // tf-demo
```

```ts
// Demo.wc.svelte

/* Write whatever svelte code u need here */
```
> Find More About svelte [here](https://svelte.dev/docs) .


4. Developing weblet by importing `Demo.wc.svelte` into `App.svelte`.

```html
<!-- App.svelte -->
<script lang="ts">
    import Demo from './elements/demo/Demo.wc.svelte';
</script>

<Demo />
```
```sh
yarn dev
```

5. Build `Demo.wc.svelte`.
```sh
yarn build
```