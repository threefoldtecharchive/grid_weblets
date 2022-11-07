import { v4 } from 'uuid';
import VM from './vm';

export default class Polygon extends VM {
	public id = v4().split('-')[0];
	public name = `al${this.id}`;
	public publicIp = false;

	// capacity
	public cpu;
	public memory;
	public rootSize;

	public customCapacity: boolean = false;

	// algo nodes config
	public nodeNetwork = 'mainnet';
	public nodeType: 'default' | 'bor' | 'heimdall' = 'default';

	// public participantNode = false
	// public relay: boolean = false

	public get valid(): boolean {
		return this.name !== '';
	}
}
