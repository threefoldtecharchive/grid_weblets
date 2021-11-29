import type { GridClient } from "grid3_client";


export function isValidName(name: string) {
  const filter1 = new RegExp(/[^a-z\d]/i);
  const filter2 = new RegExp(/^\d/);
  return !(filter1.test(name) || filter2.test(name));
}

export async function checkSuitableName(name: string) {
  if (isValidName(name)) {

    return name;
  } else {
    throw Error(`Name should be alphanumeric only`);
  }
}


export async function getSuitableGateway(client: GridClient, name: string) {
  const info = await client.gateway.getObj(name);
  return info.length == 0 ? name : name + getRandomInt();
}

function getRandomInt(): number {
  return Math.floor(Math.random() * 1000);
}
