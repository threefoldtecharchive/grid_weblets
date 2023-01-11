function deploymentErrMsg(err: string, type: string) {
  return err.includes("Cannot read properties of undefined")
    ? `Failed to deploy ${type}. Please contact our support with the message 'Cannot read properties of undefined (reading 'data')'.`
    : `Falied to deploy ${type}.`;
}

export default deploymentErrMsg;
