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
    const name = meta.NAME;
    const content = Mustache.render(tpl, {
      entryName: name,
      historyFn: genHistory(name != 'index' && name),
      scrollCache: mdfCache.getScrollCache(),
      routesPath: meta.ROUTES_IMPORT,
      appPath: findAppFile(paths.absSrcPath, name),
    });

    api.writeFile(`${paths.absTmpPath}/${meta.MDF_FILE}`, prettierFormat(content));
  });

  /**
   * 查找项目配置文件，可以共用 app.ts
   */
  function findAppFile(prefix: string, name: string) {
    const paths = [
      `${prefix}/client/app-${name}.ts`,
      `${prefix}/app-${name}.ts`,
      `${prefix}/client/app.ts`,
      `${prefix}/app.ts`,
    ];

    while (paths.length) {
      const path = paths.shift();

      if (api.isExist(path!)) {
        return path;
      }
    }

    return undefined;
  }
}
