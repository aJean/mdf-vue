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

// @ts-ignore
let updater = undefined;

function initUpdater(api) {
  updater = (0, _lodash.debounce)(function ({
    filename,
    source
  }) {
    const paths = api.paths,
          cwd = api.cwd;
    const filePath = (0, _path.relative)((0, _path.join)(cwd, (0, _utils.genRoutesPath)(api)), filename); // 用变化的文件反解出路由 path

    const routePath = (0, _utils2.genRoutePath)(filePath.replace((0, _path.extname)(filePath), ''));
    const content = (0, _fs.readFileSync)((0, _path.join)(paths.absTmpPath, 'routes.ts'), {
      encoding: 'utf-8'
    }); // 把 routes.ts 读到内存

    const routes = (0, _requireFromString.default)(content.replace('export default', 'module.exports ='));
    let isModify = false;
    let isNeedMdf = false; // 递归找到对应的路由对象

    function routePatch(route) {
      // 文件与路由匹配
      if (route.path === routePath) {
        const context = (0, _vm.createContext)({
          temp: {}
        });
        (0, _vm.runInContext)(`temp=${source}`, context); // 滚动行为

        isNeedMdf = (0, _utils2.collectScrollCache)(context, filename);
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

    routes.forEach(routePatch);

    if (isModify) {
      (0, _write.default)(routes, api);
    } // 需要重新生产入口文件


    if (isNeedMdf) {
      (0, _mdf.genMdf)(api);
    }
  }, 200);
}

function getUpdater() {
  return updater;
}