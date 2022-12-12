# Install nodejs ^16.0.0

You may need to remove old versions of nodejs

```bash
sudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
sudo rm -rf /usr/local/lib/node*
sudo rm -rf /usr/local/bin/node*
sudo rm -rf /usr/local/include/node*

sudo apt-get purge nodejs npm
sudo apt autoremove
```

Dowload the latest binary from the [official nodejs site](https://nodejs.org/en/download/).

```bash
tar -xf node-v#.#.#-linux-x64.tar.xz
sudo mv node-v#.#.#-linux-x64/bin/* /usr/local/bin/
sudo mv node-v#.#.#-linux-x64/lib/node_modules/ /usr/local/lib/
```

Verify your installation.

```bash
node -v
npm -v
```

## Make sure to install the latest stable Node version to avoid errors while installing node_modules

```bash
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

## Install yarn

```bash
npm install --global yarn
yarn --version
```

## Add node-gyp & libtool

```bash
sudo npm install -g node-gyp
sudo apt update
sudo apt install autoconf automake g++ libtool libtool-bin
```

## Increase the Max Memory for Node and for nodejs version newer than 16

To avoid the `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` run the following command:

```bash
export NODE_OPTIONS="--max-old-space-size=8192 --openssl-legacy-provider"
```

Or to make it permanent:

```bash
echo "export NODE_OPTIONS='--max-old-space-size=8192 --openssl-legacy-provider'" >> ~/.bashrc
source ~/.bashrc
```
