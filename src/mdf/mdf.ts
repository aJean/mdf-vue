import { IApi } from '@mdfjs/types';
import { prettierFormat } from '@mdfjs/utils';
import { join } from 'path';
import { mdfCache } from '../utils';

/**
 * @file 生成入口文件
 */

export default function entry(api: IApi) {
  api.onCodeGenerate({
    name: 'genVue',
    fn() {
      genMdf(api);
    },
  });
}

export function genMdf(api: IApi) {
  const { paths, Mustache } = api;
  const { history, project } = api.getConfig();
  const tpl = api.getFile(join(__dirname, 'mdf.tpl'));
  // 路由类型
  const genHistory = () => {
    const { type, base = '' } = history;
    let historyFn = `createMemoryHistory('${base}')`;

    switch (type) {
      case 'hash':
        historyFn = `createWebHashHistory('${base}')`;
        break;

      case 'browser':
        historyFn = `createWebHistory('${base}')`;
        break;
    }

    return historyFn;
  };

  // 此时 multi 已经被写入 META data
  api.fromMeta((meta) => {
    const content = Mustache.render(tpl, {
      historyFn: genHistory(),
      scrollCache: mdfCache.getScrollCache(),
      routesPath: meta.ROUTES_IMPORT,
    });

    api.writeFile(`${paths.absTmpPath}/${meta.MDF_FILE}`, prettierFormat(content));
  });
}
