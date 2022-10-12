export function getResources(network, type) {
  let cpu = 2;
  let memory = 1024 * 4;
  let rootSize = 50;

  if (type == "participant" || type == "default") {
    rootSize = 100;
  }
  if (type == "relay" && network == "testnet") {
    cpu = 4;
    memory = 1024 * 8;
    rootSize = 400;
  }
  if (type == "relay" && network == "mainnet") {
    cpu = 4;
    memory = 1024 * 8;
    rootSize = 950;
  }
  if (type == "indexer" && network == "testnet") {
    cpu = 4;
    memory = 1024 * 8;
    rootSize = 1300;
  }
  if (type == "indexer" && network == "mainnet") {
    cpu = 4;
    memory = 1024 * 8;
    rootSize = 1500;
  }

  return [cpu, memory, rootSize];
}
