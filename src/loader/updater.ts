import { IApi } from '@mdfjs/types';
import { genRoutesPath } from '@mdfjs/utils';
import { readFileSync } from 'fs';
import { debounce, eq, isEmpty } from 'lodash';
// @ts-ignore
import requireFromString from 'require-from-string';
import { runInContext, createContext } from 'vm';
import { extname, join, relative } from 'path';
import { normalizePath } from '../utils';
import { IRoute } from '../route/getRoutes';
import writeRoutes from '../route/writeRoutes';

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
    const routePath = normalizePath(filePath.replace(extname(filePath), ''));
    const content = readFileSync(join(paths.absTmpPath, 'routes.ts'), { encoding: 'utf-8' });
    const routes = requireFromString(content.replace('export default', 'module.exports ='));
    let isModify = false;

    function routePatch(route: IRoute) {
      // 文件与路由匹配
      if (route.path === routePath) {
        const context = createContext({ temp: {} });
        runInContext(`temp=${source}`, context);

        Object.keys(context.temp).forEach((k) => {
          if (!eq(context.temp[k], route)) {
            route[k] = context.temp[k];
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
  }, 200);
}

export function getUpdater() {
  return updater;
};