import { existsSync, readdirSync, statSync } from 'fs';
import { basename, extname, join, relative } from 'path';
import { camelCase } from 'lodash';
import { findFile, normalizePath, winPath, RE_DYNAMIC_ROUTE } from '../utils';
import assert from 'assert';

/**
 * @file getRoutes
 */

interface IOpts {
  root: string;
  relDir?: string;
}

export interface IRoute {
  name: string;
  component?: Function;
  path?: string;
  children?: IRoute[] | null;
  wrappers?: string[];
  /**是否是动态路由 */
  __isDynamic?: boolean;
  componentPath?: string;
  [key: string]: any;
}

/**
 * 查找页面类型的文件，目前先查到所以再过滤，可以优化
 */
function findPages(root: string) {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root).filter((file) => {
    const absFile = join(root, file);
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

function fileToRouteReducer(opts: IOpts, memo: IRoute[], file: string) {
  const { root, relDir = '' } = opts;
  const absFile = join(root, relDir, file);
  const stats = statSync(absFile);
  const __isDynamic = RE_DYNAMIC_ROUTE.test(file);

  if (stats.isDirectory()) {
    const relFile = join(relDir, file);
    const layoutFile = findFile({
      base: join(root, relFile),
      fileNameWithoutExt: '_layout',
      type: 'javascript',
    });
    const children = getRoutes({ ...opts, relDir: join(relFile) });
    const path = normalizePath(relFile);
    const routeName = camelCase(path);
    const route: IRoute = {
      path,
      children: null,
      name: routeName,
      __isDynamic,
      ...(layoutFile
        ? {
            componentPath: layoutFile.path,
          }
        : {
            __toMerge: true,
            componentPath: '',
          }),
    };

    if (children.length) {
      route.children = children;
    }

    memo.push(normalizeRoute(route, opts));
  } else {
    const bName = basename(file, extname(file));
    const path = normalizePath(join(relDir, bName));
    const routeName = camelCase(path);

    memo.push(
      normalizeRoute(
        {
          path,
          name: routeName,
          componentPath: absFile,
          children: null,
          __isDynamic,
        },
        opts,
      ),
    );
  }

  return memo;
}

function normalizeRoute(route: IRoute, opts: IOpts) {
  if (route.componentPath) {
    try {
      const componentPath = winPath(relative(join(opts.root, '..'), route.componentPath));
      route.component = new Function("return import('@/" + componentPath + "');");
    } catch (error) {
      console.error(error);
    }
  }
  return route;
}

function normalizeRoutes(routes: IRoute[]): IRoute[] {
  const paramsRoutes: IRoute[] = [];
  const layoutRoutes: IRoute[] = [];

  routes.forEach((route) => {
    const { __isDynamic } = route;
    delete route.__isDynamic;
    if (__isDynamic) {
      paramsRoutes.push(route);
    } else {
      layoutRoutes.push(route);
    }
  });

  assert(paramsRoutes.length <= 1, `We should not have multiple dynamic routes under a directory.`);

  return [...layoutRoutes, ...paramsRoutes].reduce((memo, route) => {
    if (route.__toMerge && route.children) {
      memo = memo.concat(route.children);
    } else {
      memo.push(route);
    }
    return memo;
  }, [] as IRoute[]);
}

export default function getRoutes(opts: IOpts) {
  const { root, relDir = '' } = opts;
  const files = findPages(join(root, relDir));
  console.log(files);
  const routes = normalizeRoutes(files.reduce(fileToRouteReducer.bind(null, opts), []));

  return routes;
}
