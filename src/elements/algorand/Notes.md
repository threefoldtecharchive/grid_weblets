## Algorand

### Envvars

```bash
SSH_KEY # your public ssh key
NETWORK # one of algorand nets [mainnet, testnet, betanet, devnet]
NODE_TYPE # algorand node type [default, participant, relay, indexer]
ACCOUNT_MNEMONICS # account mnemonics that have some microalgo to do the participation transaction
FIRST_ROUND # first validation block (get it from algoexplorer or use 24M)
LAST_ROUND # last validation block (26M is reasonable range)
```

### Notes

- Check the disks sizes needed for the node type from https://howbigisalgorand.com/
- Docker disk with at least 50GB needed it you choosed 'indexer' type
- Your account should be in the range [first, last]
