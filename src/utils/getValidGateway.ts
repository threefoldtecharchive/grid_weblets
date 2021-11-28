import type { GridClient } from "grid3_client";

export const isValid = (name: string) => {
  const regex = new RegExp(/[^a-z\d]/i);
  const regex2 = new RegExp(/^\d/);
  return regex.test(name) ? false : regex2.test(name) ? false : true;
};

export async function checkSuitableName(name: string) {
  const regex = new RegExp(/[^a-z\d]/i);
  const regex2 = new RegExp(/^\d/);
  const isValid = (name: string) => {
    return regex.test(name) ? false : regex2.test(name) ? false : true;
  };
  if (isValid(name)) {
    return name;
  } else {
    throw Error(`Domain name should be alphanumeric only`);
  }
}

export async function getSuitableName(client: GridClient, name: string) {
  try {
    name = await checkSuitableName(name);
    console.log(name);
  } catch (err) {
    console.error(err);
  }
}
