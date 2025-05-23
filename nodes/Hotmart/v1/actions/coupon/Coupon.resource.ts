import * as create from './create.operation';
import * as deleteOp from './delete.operation';
import * as get from './get.operation';

export const operations = {
  create,
  delete: deleteOp,
  get,
};

export const description = [...create.description, ...get.description, ...deleteOp.description];
