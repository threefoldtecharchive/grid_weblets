export function getResources(network, type) {
	let cpu = 2;
	let memory = 1024 * 4;
	let rootSize = 50;

	if (type == 'bor' && network == 'testnet') {
		cpu = 4;
		memory = 1024 * 8;
		rootSize = 1300;
	}
	if (type == 'bor' && network == 'mainnet') {
		cpu = 4;
		memory = 1024 * 8;
		rootSize = 1500;
	}

	return [cpu, memory, rootSize];
}
