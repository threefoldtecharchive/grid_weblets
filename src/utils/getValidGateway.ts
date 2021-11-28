export function checkSuitableName(name: string) {
  const regex = new RegExp(/[^a-z\d]/i);
  const isValid = (name: string) => {
    return regex.test(name) ? false : true;
  };
  if (isValid(name)) {
    return name;
  } else {
    throw Error(`Domain name should be alphanumeric only`);
  }
}
