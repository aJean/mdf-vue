"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findRoutes;

var _fs = require("fs");

var _path = require("path");

var _lodash = require("lodash");

var _utils = require("../utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 查找页面类型的文件，目前先查到所以再过滤，可以优化
 */
function findPages(root, path) {
  const dir = path ? (0, _path.join)(root, path) : root;

  if (!(0, _fs.existsSync)(dir)) {
    return [];
  }

  return (0, _fs.readdirSync)(dir).filter(file => {
    const absFile = (0, _path.join)(dir, file);
    const stat = (0, _fs.statSync)(absFile); // pages 下排除的目录

    if (stat.isDirectory() && ['components', 'component', 'utils', 'util'].includes(file)) {
      return false;
    }

    if (file.charAt(0) === '.' || file.charAt(0) === '_') return false; // exclude test file

    if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(file)) return false; // d.ts

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


function pathToRoute(opts, memo, path) {
  const root = opts.root,
        pageDir = opts.pageDir,
        _opts$parentDir = opts.parentDir,
        parentDir = _opts$parentDir === void 0 ? '' : _opts$parentDir;
  const absPath = (0, _path.join)(root, parentDir, path);

  const __isDynamic = _utils.RE_DYNAMIC_ROUTE.test(path);

  if ((0, _fs.statSync)(absPath).isDirectory()) {
    // 相对目录用于生成路由
    const dir = (0, _path.join)(parentDir, path); // 查找目录下的 layout 作为本级目录路由，注意 index 在 files 里处理，只作为普通路由

    const layout = (0, _utils.findFile)({
      base: absPath,
      pattern: 'layout',
      type: 'javascript'
    }); // 递归查找子目录

    const children = findRoutes(_objectSpread(_objectSpread({}, opts), {}, {
      parentDir: dir
    }));
    const routePath = (0, _utils.genRoutePath)(dir, pageDir);
    const routeName = (0, _lodash.camelCase)(routePath);
    const route = {
      path: routePath,
      children: null,
      name: routeName,
      __isDynamic
    };

    if (layout) {
      route.componentPath = layout.path;
    } else {
      // 目录本身不存在实体路由，单纯作为 parent path
      route.__toMerge = true;
    }

    if (children.length) {
      route.children = children;
    }

    memo.push(addImport(route, opts)); // 页面文件，递归结束添加到上级的 children 中
  } else {
    const childName = (0, _path.basename)(path, (0, _path.extname)(path)); // 不重复收集 layout.xx

    if (childName !== 'layout') {
      const routePath = (0, _utils.genRoutePath)((0, _path.join)(parentDir, childName), pageDir);
      const routeName = (0, _lodash.camelCase)(routePath);
      const childRoute = {
        path: routePath,
        name: routeName,
        componentPath: absPath,
        children: null,
        __isDynamic
      };
      memo.push(addImport(childRoute, opts));
    }
  }

  return memo;
}
/**
 * 目前都使用 lazy 模式
 */


function addImport(route, opts) {
  if (route.componentPath) {
    try {
      // typescript 不允许 import .ts|tsx
      const importPath = (0, _utils.winPath)((0, _path.relative)(opts.root, route.componentPath)).replace(/\.(ts|tsx)$/, '');
      route.component = new Function(`return import('@/${importPath}');`);
    } catch (error) {
      console.error(error);
    }
  }

  return route;
}
/**
 * 确保路由都是有意义的
 */


function eliminateRoutes(routes) {
  return routes.reduce((memo, route) => {
    // 没有找到 layout，将这一层级消除
    if (route.__toMerge && route.children) {
      memo = memo.concat(route.children);
    } else {
      memo.push(route);
    }

    return memo;
  }, []);
}

function findRoutes(opts) {
  let routes; // 根目录 pages

  if (!opts.parentDir) {
    routes = pathToRoute(opts, [], opts.pageDir);
  } else {
    const pagePaths = findPages(opts.root, opts.parentDir);
    routes = pagePaths.reduce(pathToRoute.bind(null, opts), []);
  }

  return eliminateRoutes(routes);
}