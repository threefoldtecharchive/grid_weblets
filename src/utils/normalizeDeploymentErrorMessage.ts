function normalizeDeploymentErrorMessage(err: string, type: string) {
  return typeof err === "string" && err.includes("Cannot read properties of undefined")
    ? `Failed to deploy ${type}. Please contact our support with the message 'Cannot read properties of undefined (reading 'data')'.`
    : err;
}

export default normalizeDeploymentErrorMessage;
