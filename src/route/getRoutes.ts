import { existsSync, readdirSync, statSync } from 'fs';
import { basename, extname, join, relative } from 'path';
import { camelCase } from 'lodash';
import { findFile, genRoutePath, winPath, RE_DYNAMIC_ROUTE } from '../utils';

/**
 * @file 获取路由列表
 */

interface IOpts {
  root: string;
  parentDir?: string;
}

export interface IRoute {
  name: string;
  component?: Function;
  path?: string;
  children?: IRoute[] | null;
  wrappers?: string[];
  __isDynamic?: boolean;
  componentPath?: string;
  [key: string]: any;
}

/**
 * 查找页面类型的文件，目前先查到所以再过滤，可以优化
 */
function findPages(root: string, path?: string) {
  const dir = path ? join(root, path) : root;

  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).filter((file) => {
    const absFile = join(dir, file);
    const stat = statSync(absFile);

    // pages 下排除的目录
    if (stat.isDirectory() && ['components', 'component', 'utils', 'util'].includes(file)) {
      return false;
    }

    if (file.charAt(0) === '.' || file.charAt(0) === '_') return false;
    // exclude test file
    if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(file)) return false;
    // d.ts
    if (/\.d\.ts$/.test(file)) return false;

    if (stat.isFile()) {
      if (!/\.((j|t)sx?|vue)$/.test(file)) return false;
    }

    return true;
  });
}

/**
 * 将文件路径转化为路由对象
 */
function pathToRoute(opts: IOpts, memo: IRoute[], path: string) {
  const { root, parentDir = '' } = opts;
  const absPath = join(root, parentDir, path);
  const __isDynamic = RE_DYNAMIC_ROUTE.test(path);

  if (statSync(absPath).isDirectory()) {
    // 相对目录用于生成路由
    const dir = join(parentDir, path);
    // 查找目录下的 layout 作为本级目录路由，注意 index 在 files 里处理，只作为普通路由
    const layout = findFile({ base: absPath, pattern: 'layout', type: 'javascript' });
    // 递归查找子目录
    const children = getRoutes({ ...opts, parentDir: dir });
    const routePath = genRoutePath(dir);
    const routeName = camelCase(routePath);
    const route: IRoute = { path: routePath, children: null, name: routeName, __isDynamic };

    if (layout) {
      route.componentPath = layout.path;
      // 目录本身不存在实体路由，单纯作为 parent path
    } else {
      route.__toMerge = true;
    }

    if (children.length) {
      route.children = children;
    }

    memo.push(addImport(route, opts));
    // 页面文件，递归结束添加到上级的 children 中
  } else {
    const childName = basename(path, extname(path));

    // 不重复收集 layout.xx
    if (childName !== 'layout') {
      const routePath = genRoutePath(join(parentDir, childName));
      const routeName = camelCase(routePath);
      const childRoute = {
        path: routePath,
        name: routeName,
        componentPath: absPath,
        children: null,
        __isDynamic,
      };

      memo.push(addImport(childRoute, opts));
    }
  }

  return memo;
}

/**
 * 目前都使用 lazy 模式
 */
function addImport(route: IRoute, opts: IOpts) {
  const path = route.componentPath;

  if (path) {
    try {
      let componentPath = winPath(relative(opts.root, path));
      // typescript 不允许 import .ts|tsx
      componentPath = componentPath.replace(/\.(ts|tsx)$/, '');

      route.component = new Function("return import('@/" + componentPath + "');");
    } catch (error) {
      console.error(error);
    }
  }

  return route;
}

/**
 * 确保路由都是有意义的
 */
function eliminateRoutes(routes: IRoute[]): IRoute[] {
  return routes.reduce((memo, route) => {
    // 没有找到 layout，将这一层级消除
    if (route.__toMerge && route.children) {
      memo = memo.concat(route.children);
    } else {
      memo.push(route);
    }
    return memo;
  }, [] as IRoute[]);
}

export default function getRoutes(opts: IOpts) {
  let routes;

  if (!opts.parentDir) {
    routes = pathToRoute(opts, [], 'pages');
  } else {
    const pagePaths = findPages(opts.root, opts.parentDir);
    routes = pagePaths.reduce(pathToRoute.bind(null, opts), []);
  }

  return eliminateRoutes(routes);
}
