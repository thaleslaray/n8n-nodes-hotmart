import * as getAll from './getAll.operation';
import * as getInfo from './getInfo.operation';

export const operations = {
	getAll,
	getInfo,
};

export const description = [
	...getAll.description,
	...getInfo.description,
];
