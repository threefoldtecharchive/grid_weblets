#### Note

* by default we use nginx ingress controller.
* if you want to use the ingress, you need to install the ingress controller.

#### 1. Deploying the TFGrid Chart 

```bash
        helm install <helm_name> ./weblets-chart --values ./tfgrid-stats/values.yaml --set ingress.hosts[0].host=<domain_name>
```

#### 2. Test it, and check the results

```bash
    curl -X GET http://<domain_name>/
```

#### 3. Deploying with nginx ingress and https

```bash 
    helm install <helm_name> ./weblets-chart/ --values ./weblets-chart/values.yaml --set ingress.hosts[0].host=<domain_name> --set ingress.tls[0].hosts[0]=<domain_name> --set ingress.tls[0].secretName=<secret_name>
```