import { IApi } from '@mdfjs/types';
import { prettierFormat } from '@mdfjs/utils';
import { join } from 'path';

/**
 * @file 生成入口文件
 */

export default function entry(api: IApi) {
  const { paths, Mustache } = api;
  const { type, base = '' } = api.getConfig().history;

  let historyFn = '';

  switch (type) {
    case 'hash':
      historyFn = `createWebHashHistory('${base}')`;
      break;

    case 'browser':
      historyFn = `createWebHistory('${base}')`;
      break;

    default:
      historyFn = `createMemoryHistory('${base}')`;
  }
  
  api.onCodeGenerate(() => {
    const tpl = api.getFile(join(__dirname, 'mdf.tpl'));
    const content = Mustache.render(tpl, { historyFn });

    api.writeFile(`${paths.absTmpPath}/mdf.ts`, prettierFormat(content));
  });
}
