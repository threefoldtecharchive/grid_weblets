export default async function checkVMExist(grid, type, name) {
  // check if the vm exists in default namespace
  const oldVM = await grid.machines.getObj(name);
  if (oldVM.length != 0) {
    const flist = oldVM[0]["flist"] as string;
    if (flist.includes(type)) {
      throw Error(
        `Another ${type} deployment with the same name ${name} already exists`
      );
    }
  }

  // For invalidating the cashed keys in the KV store, getObj check if the key has no deployments. it is deleted.
  grid.projectName = type;
  grid._connect();
  await grid.machines.getObj(name);
}

export async function checkGW(grid, domainName, type) {
  // deploy on project namespace
  grid.projectName = type;
  grid._connect();

  // For invalidating the cashed keys in the KV store, getObj check if the key has no deployments. it is deleted.
  await grid.gateway.getObj(domainName);
}
