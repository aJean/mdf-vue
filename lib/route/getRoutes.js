"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getRoutes;

var _fs = require("fs");

var _path = require("path");

var _lodash = require("lodash");

var _utils = require("../utils");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 查找页面类型的文件，目前先查到所以再过滤，可以优化
 */
function findPages(root) {
  if (!(0, _fs.existsSync)(root)) {
    return [];
  }

  return (0, _fs.readdirSync)(root).filter(file => {
    const absFile = (0, _path.join)(root, file);
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

function fileToRouteReducer(opts, memo, file) {
  const root = opts.root,
        _opts$relDir = opts.relDir,
        relDir = _opts$relDir === void 0 ? '' : _opts$relDir;
  const absFile = (0, _path.join)(root, relDir, file);
  const stats = (0, _fs.statSync)(absFile);

  const __isDynamic = _utils.RE_DYNAMIC_ROUTE.test(file);

  if (stats.isDirectory()) {
    const relFile = (0, _path.join)(relDir, file);
    const layoutFile = (0, _utils.findFile)({
      base: (0, _path.join)(root, relFile),
      fileNameWithoutExt: '_layout',
      type: 'javascript'
    });
    const children = getRoutes(_objectSpread(_objectSpread({}, opts), {}, {
      relDir: (0, _path.join)(relFile)
    }));
    const path = (0, _utils.normalizePath)(relFile);
    const routeName = (0, _lodash.camelCase)(path);

    const route = _objectSpread({
      path,
      children: null,
      name: routeName,
      __isDynamic
    }, layoutFile ? {
      componentPath: layoutFile.path
    } : {
      __toMerge: true,
      componentPath: ''
    });

    if (children.length) {
      route.children = children;
    }

    memo.push(normalizeRoute(route, opts));
  } else {
    const bName = (0, _path.basename)(file, (0, _path.extname)(file));
    const path = (0, _utils.normalizePath)((0, _path.join)(relDir, bName));
    const routeName = (0, _lodash.camelCase)(path);
    memo.push(normalizeRoute({
      path,
      name: routeName,
      componentPath: absFile,
      children: null,
      __isDynamic
    }, opts));
  }

  return memo;
}

function normalizeRoute(route, opts) {
  if (route.componentPath) {
    try {
      const componentPath = (0, _utils.winPath)((0, _path.relative)((0, _path.join)(opts.root, '..'), route.componentPath));
      route.component = new Function("return import('@/" + componentPath + "');");
    } catch (error) {
      console.error(error);
    }
  }

  return route;
}

function normalizeRoutes(routes) {
  const paramsRoutes = [];
  const layoutRoutes = [];
  routes.forEach(route => {
    const __isDynamic = route.__isDynamic;
    delete route.__isDynamic;

    if (__isDynamic) {
      paramsRoutes.push(route);
    } else {
      layoutRoutes.push(route);
    }
  });
  (0, _assert.default)(paramsRoutes.length <= 1, `We should not have multiple dynamic routes under a directory.`);
  return [...layoutRoutes, ...paramsRoutes].reduce((memo, route) => {
    if (route.__toMerge && route.children) {
      memo = memo.concat(route.children);
    } else {
      memo.push(route);
    }

    return memo;
  }, []);
}

function getRoutes(opts) {
  const root = opts.root,
        _opts$relDir2 = opts.relDir,
        relDir = _opts$relDir2 === void 0 ? '' : _opts$relDir2;
  const files = findPages((0, _path.join)(root, relDir));
  console.log(files);
  const routes = normalizeRoutes(files.reduce(fileToRouteReducer.bind(null, opts), []));
  return routes;
}