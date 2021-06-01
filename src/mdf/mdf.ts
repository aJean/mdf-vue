import { IApi } from '@mdfjs/types';
import { prettierFormat } from '@mdfjs/utils';
import { join } from 'path';
import { mdfCache } from '../utils';

/**
 * @file 生成入口文件
 */

export default function entry(api: IApi) {
  const { paths, Mustache } = api;
  const { type, base = '' } = api.getConfig().history;

  let historyFn = `createMemoryHistory('${base}')`;

  switch (type) {
    case 'hash':
      historyFn = `createWebHashHistory('${base}')`;
      break;

    case 'browser':
      historyFn = `createWebHistory('${base}')`;
      break;
  }

  api.onCodeGenerate(() => {
    const scrollBehavior = mdfCache.getScrollBehavior();
    const tpl = api.getFile(join(__dirname, 'mdf.tpl'));
    const content = Mustache.render(tpl, { historyFn, scrollBehavior });

    api.writeFile(`${paths.absTmpPath}/mdf.ts`, prettierFormat(content));
  });
}
