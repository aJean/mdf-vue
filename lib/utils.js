"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genRootPath = genRootPath;
exports.genRoutesPath = genRoutesPath;
exports.genModelsPath = genModelsPath;
exports.getFile = getFile;
exports.winPath = winPath;
exports.normalizePath = normalizePath;
exports.routeToChunkName = routeToChunkName;
exports.RE_DYNAMIC_ROUTE = void 0;

var _path = require("path");

var _fs = require("fs");

var _lodash = require("lodash");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * @file utils
 */
function genRootPath(api) {
  const _api$getConfig = api.getConfig(),
        framework = _api$getConfig.framework;

  return framework.root || 'src';
}

function genRoutesPath(api) {
  return `${genRootPath(api)}/pages`;
}

function genModelsPath(api) {
  return `${genRootPath(api)}/models`;
}

const RE_DYNAMIC_ROUTE = /^\[(.+?)\]/;
exports.RE_DYNAMIC_ROUTE = RE_DYNAMIC_ROUTE;
const extsMap = {
  javascript: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
  css: ['.less', '.sass', '.scss', '.stylus', '.css']
};
/**
 * Try to match the exact extname of the file in a specific directory.
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */

function getFile(opts) {
  const exts = extsMap[opts.type];

  var _iterator = _createForOfIteratorHelper(exts),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const ext = _step.value;
      const filename = `${opts.fileNameWithoutExt}${ext}`;
      const path = winPath((0, _path.join)(opts.base, filename));

      if ((0, _fs.existsSync)(path)) {
        return {
          path,
          filename
        };
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return null;
}

function winPath(path) {
  const isExtended = /^\\\\\?\\/.test(path);
  return isExtended ? path : path.replace(/\\/g, '/');
}
/**
 * 标准化 route path
 */


function normalizePath(path) {
  path = winPath(path).split('/').map(p => {
    // dynamic route
    p = p.replace(RE_DYNAMIC_ROUTE, ':$1'); // :post$ => :post?

    if (p.endsWith('$')) {
      p = p.slice(0, -1) + '?';
    }

    p = (0, _lodash.kebabCase)(p);
    return p;
  }).join('/');
  path = `/${path}`; // /index/index -> /

  if (path === '/index/index') {
    path = '/';
  } // /xxxx/index -> /xxxx/


  path = path.replace(/\/index$/, '/'); // remove the last slash
  // e.g. /abc/ -> /abc

  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }

  return path;
}
/**
 * transform route component into webpack chunkName
 */


function routeToChunkName(data) {
  function lastSlash(str) {
    return str[str.length - 1] === '/' ? str : `${str}/`;
  }

  const _data$route = data.route,
        route = _data$route === void 0 ? {} : _data$route,
        _data$cwd = data.cwd,
        cwd = _data$cwd === void 0 ? '/' : _data$cwd;
  return typeof route.component === 'string' ? route.component.replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '').replace(/^.(\/|\\)/, '').replace(/(\/|\\)/g, '__').replace(/\.jsx?$/, '').replace(/\.tsx?$/, '').replace(/^src__/, '').replace(/\.\.__/g, '') // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
  // ref: https://github.com/umijs/umi/issues/4155
  .replace(/[\[\]]/g, '') // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
  .replace(/^.umi-production__/, 't__').replace(/^pages__/, 'p__').replace(/^page__/, 'p__') : '';
}