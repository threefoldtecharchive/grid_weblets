import type Polygon from '../types/polygon';
import type { IProfile } from '../types/Profile';

import { Network } from '../types/kubernetes';
import createNetwork from './createNetwork';

import deploy from './deploy';
import checkVMExist from './prepareDeployment';

export default async function deployPolygon(data: Polygon, profile: IProfile) {
	const deploymentInfo = await depoloyPolygonVM(data, profile);
	return { deploymentInfo };
}

async function depoloyPolygonVM(data: Polygon, profile: IProfile) {
	const { MachinesModel, DiskModel, GridClient, MachineModel, generateString } =
		window.configs.grid3_client;
	const {
		name,
		cpu,
		memory,
		nodeId,
		rootSize,
		publicIp,
		planetary,
		nodeNetwork,
		nodeType,
	} = data;

	// sub deployments model (vm, disk, net): <type><random_suffix>
	let randomSuffix = generateString(10).toLowerCase();

	// Private network
	const network = createNetwork(
		new Network(`nw${randomSuffix}`, '10.200.0.0/16'),
	);

	// Disk Specs
	const disk = new DiskModel();
	disk.name = `disk${randomSuffix}`;
	disk.size = 50;
	disk.mountpoint = '/var/lib/docker';

	// Machine specs
	const machine = new MachineModel();
	machine.name = name; //`vm${randomSuffix}`;
	machine.cpu = cpu;
	machine.memory = memory;
	machine.disks = [];
	machine.node_id = nodeId;
	machine.public_ip = publicIp;
	machine.planetary = planetary;
	machine.qsfs_disks = [];
	machine.rootfs_size = rootSize;
	machine.flist =
		'https://hub.grid.tf/slayerprincessmetal.3bot/threefolddev-polygon-bor.flist';
	machine.entrypoint = '/sbin/zinit init';
	machine.env = {
		SSH_KEY: profile.sshKey,
		NETWORK: nodeNetwork,
		NODE_TYPE: nodeType,
	};

	// Machines specs
	const machines = new MachinesModel();
	machines.name = name;
	machines.machines = [machine];
	machines.network = network;
	machines.description = 'Polygon node';

	const metadate = {
		type: 'vm',
		name: name,
		projectName: 'Polygon',
	};
	machines.metadata = JSON.stringify(metadate);

	// Deploy
	return deploy(profile, 'Polygon', name, async (grid) => {
		await checkVMExist(grid, 'polygon', name);

		return grid.machines
			.deploy(machines)
			.then(() => grid.machines.getObj(name))
			.then(([vm]) => vm);
	});
}
