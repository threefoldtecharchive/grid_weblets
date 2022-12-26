export function setStakeAmount(value: string): string {
  // Setting stake amount by multiplying by 1e7 then add TFT word.
  return (+value * 1e7).toString() + "TFT";
}

export function getNetwork(): string {
  // Get network type from domain.
  const networks = ["dev", "qa", "test", "main"];
  const host = window.location.host;
  let netWork = "";
  networks.includes(host.split(".")[1]) ? (netWork = host.split(".")[1]) : (netWork = "main");
  return netWork;
}

export function configVariables(host: string) {
  // Replace dev with main when you deploying the validator on localhost.
  const env = {
    dev: {
      chainId: "threefold-hub-testnet",
      gravityAddress: "0x61fa4C9bBC80B6817F77EB21Bbe8907ED2a24913",
      ethereumRpc: "https://data-seed-prebsc-2-s1.binance.org:8545",
      persistentPeers: "67bd27ada60adce769441d552b420466c2082ecc@185.206.122.141:26656",
      genesisUrl:
        "https://gist.githubusercontent.com/OmarElawady/de4b18f77835a86581e5824ca954d646/raw/8b5052408fcd0c7deab06bd4b4b9d0236b5b1e6c/genesis.json",
      orchestrator_fees: "20000000TFT",
      gas_prices: "80TFT",
      gas_adjustment: "1.6",
    },
    qa: {
      chainId: "threefold-hub-testnet",
      gravityAddress: "0x61fa4C9bBC80B6817F77EB21Bbe8907ED2a24913",
      ethereumRpc: "https://data-seed-prebsc-2-s1.binance.org:8545",
      persistentPeers: "67bd27ada60adce769441d552b420466c2082ecc@185.206.122.141:26656",
      genesisUrl:
        "https://gist.githubusercontent.com/OmarElawady/de4b18f77835a86581e5824ca954d646/raw/8b5052408fcd0c7deab06bd4b4b9d0236b5b1e6c/genesis.json",
      orchestrator_fees: "20000000TFT",
      gas_prices: "80TFT",
      gas_adjustment: "1.6",
    },
    test: {
      chainId: "threefold-hub-testnet",
      gravityAddress: "0x61fa4C9bBC80B6817F77EB21Bbe8907ED2a24913",
      ethereumRpc: "https://data-seed-prebsc-2-s1.binance.org:8545",
      persistentPeers: "67bd27ada60adce769441d552b420466c2082ecc@185.206.122.141:26656",
      genesisUrl:
        "https://gist.githubusercontent.com/OmarElawady/de4b18f77835a86581e5824ca954d646/raw/8b5052408fcd0c7deab06bd4b4b9d0236b5b1e6c/genesis.json",
      orchestrator_fees: "20000000TFT",
      gas_prices: "80TFT",
      gas_adjustment: "1.6",
    },
    main: {
      chainId: "",
      gravityAddress: "",
      ethereumRpc: "",
      persistentPeers: "",
      genesisUrl: "",
      orchestrator_fees: "",
      gas_prices: "",
      gas_adjustment: "",
    },
  };
  return env[host];
}
