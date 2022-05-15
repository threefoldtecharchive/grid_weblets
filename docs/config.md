## Install nodejs ^16.0.0

You may need to remove old versions of nodejs.

```bash
sudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
sudo rm -rf /usr/local/lib/node*
sudo rm -rf /usr/local/bin/node*
sudo rm -rf /usr/local/include/node*

sudo apt-get purge nodejs npm
sudo apt autoremove
```

Dowload the latest binary from the [official nodejs site](https://nodejs.org/en/download/).

```
tar -xf node-v#.#.#-linux-x64.tar.xz
sudo mv node-v#.#.#-linux-x64/bin/* /usr/local/bin/
sudo mv node-v#.#.#-linux-x64/lib/node_modules/ /usr/local/lib/
```

Verify your installation.

```bash
node -v
npm -v
```

## Install yarn

```bash
npm install --global yarn
yarn --version
```

## Optional Building libs

```bash
sudo apt-get update
sudo apt-get install libtool gcc g++ make
```

## Increase the Max Memory for Node

To avoid the `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` run the following command:

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

Or to make it permanent:

```bash
echo "export NODE_OPTIONS=\"--max-old-space-size=8192\"" >> ~/.bashrc
```
