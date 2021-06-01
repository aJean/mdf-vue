import { IApi } from '@mdfjs/types';
import { genRoutesPath } from '@mdfjs/utils';
import { readFileSync } from 'fs';
import { debounce, eq, isEmpty } from 'lodash';
// @ts-ignore
import requireFromString from 'require-from-string';
import { runInContext, createContext } from 'vm';
import { extname, join, relative } from 'path';
import { genRoutePath, assignContext, collectScrollBehavior } from '../utils';
import { IRoute } from '../route/find';
import writeRoutes from '../route/write';

/**
 * @file 把 router block 的变化同步到 routes
 */

type LoaderOpts = {
  filename: string;
  source: string;
};

let updater: any = undefined;

export function initUpdater(api: IApi) {
  updater = debounce(function ({ filename, source }: LoaderOpts) {
    const { paths, cwd } = api;
    const filePath = relative(join(cwd, genRoutesPath(api)), filename);
    // 用变化的文件反解出路由 path
    const routePath = genRoutePath(filePath.replace(extname(filePath), ''));
    const content = readFileSync(join(paths.absTmpPath, 'routes.ts'), { encoding: 'utf-8' });
    // 把 routes.ts 读到内存
    const routes = requireFromString(content.replace('export default', 'module.exports ='));
    let isModify = false;
    let isNeedMdf = false;

    // 递归找到对应的路由对象
    function routePatch(route: IRoute) {
      // 文件与路由匹配
      if (route.path === routePath) {
        const context = createContext({ temp: {} });
        runInContext(`temp=${source}`, context);
        // 滚动行为
        isNeedMdf = collectScrollBehavior(context);

        const temp = assignContext(context);
        Object.keys(temp).forEach((k) => {
          if (!eq(temp[k], route[k])) {
            route[k] = temp[k];
            isModify = true;
          }
        });
      } else if (!isEmpty(route.children)) {
        route.children?.forEach(routePatch);
      }
    }
    routes.forEach(routePatch);

    if (isModify) {
      writeRoutes(routes, api);
    }
    // 需要触发 generatorCode
    if (isNeedMdf) {

    }
  }, 200);
}

export function getUpdater() {
  return updater;
}
