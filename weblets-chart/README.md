#### Note

* by default we use nginx ingress controller.
* if you want to use the ingress, you need to install the ingress controller.

#### 1. Deploying the TFGrid Chart 

```bash
        helm install <helm_name> . --values ./values.yaml --set ingress.hosts[0].host=<domain_name>
```

#### 2. Test it, and check the results

```bash
    curl -X GET http://<domain_name>/
```
