# Releasing process

To create a new release there are some steps is required:

## 1. Update Charts file
In [charts.yaml](../weblets-chart/Chart.yaml) replace the value of `appVersion` with the new release tag.
## 2. **Create a new release**
  create a new release with same value of `appVersion` in `charts.yaml`.
  
  > You can find more details about creating a new release in [Release projects](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release).
  
## 3. **Create a new issue on [tf_operations](https://github.com/threefoldtech/tf_operations)**
  In the new issue you have to mention the following: 
  - **Release link**
  
      You can find it by changing the branch to the needed tag and then copy the URL. 
  - **Charts directory link**
  
      In this case will be [weblets-chart](../weblets-chart/)
