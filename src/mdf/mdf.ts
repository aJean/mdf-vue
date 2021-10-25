import { IApi } from '@mdfjs/types';
import { prettierFormat } from '@mdfjs/utils';
import { join } from 'path';
import { mdfCache } from '../utils';

/**
 * @file 生成入口文件
 *       这里有一个标准认知：index == spa == mpa 默认首页
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
  const { history } = api.getConfig();
  const tpl = api.getFile(join(__dirname, 'mdf.tpl'));
  // 路由类型
  const genHistory = (path: any) => {
    const { type, base = '' } = history;
    const prefix = path ? `${base}/${path}` : base;
    let historyFn = `createWebHistory('${prefix}')`;

    switch (type) {
      case 'hash':
        historyFn = `createWebHashHistory('${prefix}')`;
        break;
      case 'memo':
        historyFn = `createMemoryHistory('${prefix}')`;
        break;
    }

    return historyFn;
  };

  // 此时 multi 已经被写入 META data
  api.fromMeta((meta) => {
    const content = Mustache.render(tpl, {
      historyFn: genHistory(meta.NAME != 'index' && meta.NAME),
      scrollCache: mdfCache.getScrollCache(),
      routesPath: meta.ROUTES_IMPORT,
    });

    api.writeFile(`${paths.absTmpPath}/${meta.MDF_FILE}`, prettierFormat(content));
  });
}
