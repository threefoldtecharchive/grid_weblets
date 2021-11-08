# Grid Weblets
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-informational?style=flat-square)

A svelte project for creating web components that should be used every where else.

## Contents
- Elements
    - [K8S](#kubernetes)
    - [VM](#virtual-machine)
    - [Caprover](#caprover)
    - [Deployed List](#deployed-list)


### Kubernetes
```html
<tf-kubernetes></tf-kubernetes>
```

### Virtual Machine
```html
<tf-vm></tf-vm>
```

### Caprover
```html
<tf-caprover></tf-caprover>
```

### Caprover
```html
<tf-deployedlist></tf-deployedlist> <!-- to show all tabs -->
<!-- Accept tab attribute      tab =  'vm' | 'k8s' | 'caprover' -->
<tf-deployedlist tab="k8s"></tf-deployedlist>
<tf-deployedlist tab="vm"></tf-deployedlist>
<tf-deployedlist tab="caprover"></tf-deployedlist>
```