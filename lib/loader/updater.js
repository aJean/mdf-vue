"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initUpdater = initUpdater;
exports.getUpdater = getUpdater;

var _utils = require("@mdfjs/utils");

var _fs = require("fs");

var _lodash = require("lodash");

var _requireFromString = _interopRequireDefault(require("require-from-string"));

var _vm = require("vm");

var _path = require("path");

var _utils2 = require("../utils");

var _write = _interopRequireDefault(require("../route/write"));

var _mdf = require("../mdf/mdf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

let updater = undefined;

function initUpdater(api) {
  updater = (0, _lodash.debounce)(function ({
    file,
    source
  }) {
    const _getMetaFromFile = getMetaFromFile(file),
          _getMetaFromFile2 = _slicedToArray(_getMetaFromFile, 2),
          pages = _getMetaFromFile2[0],
          routesFile = _getMetaFromFile2[1]; // 变化的路由


    const routePath = getRoutepath(api, file, pages); // 路由配置文件

    const code = getRoutesSource(api, routesFile); // 把 routes.ts 读到内存

    const routes = (0, _requireFromString.default)(code.replace('export default', 'module.exports ='));
    let isModify = false;
    let isNeedMdf = false; // 递归找到对应的路由对象

    function routePatch(route) {
      // 文件与路由匹配
      if (route.path === routePath) {
        const context = (0, _vm.createContext)({
          temp: {}
        });
        (0, _vm.runInContext)(`temp=${source}`, context); // vue router 滚动行为

        isNeedMdf = (0, _utils2.collectScrollCache)(context, file);
        const temp = (0, _utils2.assignContext)(context);
        Object.keys(temp).forEach(k => {
          if (!(0, _lodash.eq)(temp[k], route[k])) {
            route[k] = temp[k];
            isModify = true;
          }
        });
      } else if (!(0, _lodash.isEmpty)(route.children)) {
        var _route$children;

        (_route$children = route.children) === null || _route$children === void 0 ? void 0 : _route$children.forEach(routePatch);
      }
    }

    routes.forEach(routePatch); // 有更改重写 routes

    if (isModify) {
      (0, _write.default)(routes, api, routesFile);
    } // 需要重新生成入口文件


    if (isNeedMdf) {
      (0, _mdf.genMdf)(api);
    }
  }, 200);
}

function getRoutesSource(api, name) {
  const file = (0, _path.join)(api.paths.absTmpPath, name);
  return (0, _fs.readFileSync)(file, {
    encoding: 'utf-8'
  });
}
/**
 * 用变化的文件反解出路由 path
 */


function getRoutepath(api, file, pages) {
  const ext = (0, _path.extname)(file);
  const filePath = (0, _path.relative)((0, _path.join)(api.cwd, `${(0, _utils.genStaticPath)(api)}/${pages}`), file);
  return (0, _utils2.genRoutePath)(filePath.replace(ext, ''), pages);
}
/**
 * 解析 meta data
 */


function getMetaFromFile(path) {
  const match = /.*\/(pages[^/]*)\/.*/i.exec(path);
  const pages = match ? match[1] : 'pages';
  const entry = pages.split('-')[1] || 'index';
  return [pages, `routes-${entry}.ts`];
}
/**
 * for loder
 */


function getUpdater() {
  return updater;
}