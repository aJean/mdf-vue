import { IApi } from '@mdfjs/types';
import { genStaticPath } from '@mdfjs/utils';
import { readFileSync } from 'fs';
import { debounce, eq, isEmpty } from 'lodash';
// @ts-ignore
import requireFromString from 'require-from-string';
import { runInContext, createContext } from 'vm';
import { extname, join, relative } from 'path';
import { assignContext, collectScrollCache, genRoutePath } from '../utils';
import { IRoute } from '../route/find';
import writeRoutes from '../route/write';
import { genMdf } from '../mdf/mdf';

/**
 * @file 把 router-block 的变化同步到 routes config
 *       必须遵守命名规范 multi: { home: 'pages-home' }
 */

type LoaderOpts = {
  file: string;
  source: string;
};

let updater: any = undefined;

export function initUpdater(api: IApi) {
  updater = debounce(function ({ file, source }: LoaderOpts) {
    const [pages, routesFile] = getMetaFromFile(file);
    // 变化的路由
    const routePath = getRoutepath(api, file, pages);
    // 路由配置文件
    const code = getRoutesSource(api, routesFile);
    // 把 routes.ts 读到内存
    const routes = requireFromString(code.replace('export default', 'module.exports ='));
    let isModify = false;
    let isNeedMdf = false;

    // 递归找到对应的路由对象
    function routePatch(route: IRoute) {
      // 文件与路由匹配
      if (route.path === routePath) {
        const context = createContext({ temp: {} });
        runInContext(`temp=${source}`, context);
        // vue router 滚动行为
        isNeedMdf = collectScrollCache(context, file);

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

    // 有更改重写 routes
    if (isModify) {
      writeRoutes(routes, api, routesFile);
    }
    // 需要重新生成入口文件
    if (isNeedMdf) {
      genMdf(api);
    }
  }, 200);
}

function getRoutesSource(api: IApi, name: string) {
  const file = join(api.paths.absTmpPath, name);
  return readFileSync(file, { encoding: 'utf-8' });
}

/**
 * 用变化的文件反解出路由 path
 */
function getRoutepath(api: IApi, file: string, pages: string) {
  const ext = extname(file);
  const filePath = relative(join(api.cwd, `${genStaticPath(api)}/${pages}`), file);

  return genRoutePath(filePath.replace(ext, ''), pages);
}

/**
 * 解析 meta data
 */
function getMetaFromFile(path: string) {
  const match = /.*\/(pages[^/]*)\/.*/i.exec(path);
  const pages = match ? match[1] : 'pages';
  const entry = pages.split('-')[1] || 'index';

  return [pages, `routes-${entry}.ts`];
}

/**
 * for loder
 */
export function getUpdater() {
  return updater;
}
