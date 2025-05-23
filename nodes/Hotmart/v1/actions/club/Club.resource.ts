import * as getModules from './getModules.operation';
import * as getPages from './getPages.operation';
import * as getAll from './getAll.operation';
import * as getProgress from './getProgress.operation';

export const operations = {
  getModules,
  getPages,
  getAll,
  getProgress,
};

export const description = [
  ...getModules.description,
  ...getPages.description,
  ...getAll.description,
  ...getProgress.description,
];
