#!/bin/bash

# Env vars with default values
MODE="${MODE:=dev}"
STELLAR_NETWORK="${STELLAR_NETWORK:=test}"

# Env vars must provide in `custom` mode
REQUIRED_ENV_VARS=(
    GRAPHQL_URL
    GRIDPROXY_URL
    SUBSTRATE_URL
    ACTIVATION_SERVICE_URL
    RELAY_DOMAIN
    BRIDGE_TFT_ADDRESS
)

STELLAR_ENV_Vars=(
    STELLAR_HORIZON_URL
    TFT_ASSET_ISSUER
)

case $MODE in
  "dev")
    GRAPHQL_URL='https://graphql.dev.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.dev.grid.tf'
    SUBSTRATE_URL='wss://tfchain.dev.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.dev.grid.tf'
    RELAY_DOMAIN='relay.dev.grid.tf'
    BRIDGE_TFT_ADDRESS=GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG
    STELLAR_NETWORK=test
  ;;

  "qa")
    GRAPHQL_URL='https://graphql.qa.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.qa.grid.tf'
    SUBSTRATE_URL='wss://tfchain.qa.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.qa.grid.tf'
    RELAY_DOMAIN='relay.qa.grid.tf'
    BRIDGE_TFT_ADDRESS=GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG
    STELLAR_NETWORK=test
  ;;

  "test")
    GRAPHQL_URL='https://graphql.test.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.test.grid.tf'
    SUBSTRATE_URL='wss://tfchain.test.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.test.grid.tf'
    RELAY_DOMAIN='relay.test.grid.tf'
    BRIDGE_TFT_ADDRESS=GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4
    STELLAR_NETWORK=main
  ;;

  "main")
    GRAPHQL_URL='https://graphql.grid.tf/graphql'
    GRIDPROXY_URL='https://gridproxy.grid.tf'
    SUBSTRATE_URL='wss://tfchain.grid.tf/ws'
    ACTIVATION_SERVICE_URL='https://activation.grid.tf'
    RELAY_DOMAIN='relay.grid.tf'
    BRIDGE_TFT_ADDRESS=GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC
    STELLAR_NETWORK=main
  ;;

  "custom")
    for i in "${REQUIRED_ENV_VARS[@]}"
    do
      if ! [[ -v $i ]]; then
        echo -e "\n\e[1;50m \e[1;31m$i is required!\e[0m\n \e[1;3mPlease set it by executing the following command."
        echo -e "\e[1;31m export\e[0m \e[1;32m$i\e[0m=\e[1;38m'Your Value Here'\n"
        return
      fi
    done
    echo -e "\e[1;33mEnvironment variables were exported before, if you want to change any of them maybe you have to re-export them or close the terminal window and start from scratch."
  ;;

  *)
    echo "Unknown 'MODE' selected!, Acceptable modes are [dev | qa | test | main | custom]\n"
    return
  ;;
esac

case $STELLAR_NETWORK in
  "test")
    STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
    TFT_ASSET_ISSUER="GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3"
  ;;
  "main")    
    STELLAR_HORIZON_URL="https://horizon.stellar.org"
    TFT_ASSET_ISSUER="GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47"
  ;;
  *)
    echo "Unknown 'STELLAR_NETWORK' selected!, Acceptable networks are [test | main]\n"
    return
  ;;
esac

configs="
window.env = {
  NETWORK: '$MODE',
  GRAPHQL_URL: '$GRAPHQL_URL',
  GRIDPROXY_URL: '$GRIDPROXY_URL',
  SUBSTRATE_URL: '$SUBSTRATE_URL',
  ACTIVATION_SERVICE_URL: '$ACTIVATION_SERVICE_URL',
  RELAY_DOMAIN: '$RELAY_DOMAIN',
  BRIDGE_TFT_ADDRESS: '$BRIDGE_TFT_ADDRESS',
  STELLAR_NETWORK: '$STELLAR_NETWORK',
  STELLAR_HORIZON_URL: '$STELLAR_HORIZON_URL',
  TFT_ASSET_ISSUER: '$TFT_ASSET_ISSUER'
};
"

# decide the config file path
[ -d dist ] && file="dist/config.js" || file="config.js"

# override the content of the config file & echo the result
echo $configs > $file
echo -e "\e[1;32m$configs"