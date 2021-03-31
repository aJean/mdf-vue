import { join } from 'path';
import { existsSync } from 'fs';
import { kebabCase } from 'lodash';
import { exit } from 'process';

/**
 * @file utils
 */

export const RE_DYNAMIC_ROUTE = /^\[(.+?)\]/;

/**
 * javascript: try to match the file with extname `.{ts(x)|js(x)}`
 * css: try to match the file with extname `.{less|sass|scss|stylus|css}`
 */
type FileType = 'javascript' | 'css';

interface IGetFileOpts {
  base: string;
  type: FileType;
  fileNameWithoutExt: string;
}

const extsMap: Record<FileType, string[]> = {
  javascript: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
  css: ['.less', '.sass', '.scss', '.stylus', '.css'],
};

/**
 * Try to match the exact extname of the file in a specific directory.
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
export function findFile(opts: IGetFileOpts) {
  const exts = extsMap[opts.type];

  for (const ext of exts) {
    const filename = `${opts.fileNameWithoutExt}${ext}`;
    const path = winPath(join(opts.base, filename));

    if (existsSync(path)) {
      return {
        path,
        filename,
      };
    }
  }

  return null;
}

export function winPath(path: string) {
  const isExtended = /^\\\\\?\\/.test(path);
  return isExtended ? path : path.replace(/\\/g, '/');
}

/**
 * 标准化 route path
 */
export function normalizePath(path: string) {
  path = winPath(path)
    .split('/')
    .map((p) => {
      // dynamic route
      p = p.replace(RE_DYNAMIC_ROUTE, ':$1');

      // :post$ => :post?
      if (p.endsWith('$')) {
        p = p.slice(0, -1) + '?';
      }
      p = kebabCase(p);
      return p;
    })
    .join('/');

  path = `/${path}`;

  // /index/index -> /
  if (path === '/index/index') {
    path = '/';
  }

  // /xxxx/index -> /xxxx/
  path = path.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * transform route component into webpack chunkName
 */
export function routeToChunkName(data: any) {
  function lastSlash(str: string) {
    return str[str.length - 1] === '/' ? str : `${str}/`;
  }

  const { route = {}, cwd = '/' } = data;
  return typeof route.component === 'string'
    ? route.component
        .replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        .replace(/[\[\]]/g, '')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__')
    : '';
}
