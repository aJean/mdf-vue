"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _getRoutes = _interopRequireDefault(require("./getRoutes"));

var _mergeRoutes = _interopRequireDefault(require("./mergeRoutes"));

var _writeRoutes = _interopRequireDefault(require("./writeRoutes"));

var _updater = require("../loader/updater");

var _utils2 = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 根据文件结构生成路由配置
 */
function routes(api) {
  const watch = api.createWatchFn();
  const routesPath = (0, _utils2.genRoutesPath)(api);
  api.describe({
    key: 'history',
    config: {
      schema(joi) {
        return joi.object({
          type: joi.string().allow('browser', 'hash', 'memory'),
          base: joi.string(),
          linkActiveClass: joi.string(),
          linkExactActiveClass: joi.string(),
          parseQuery: joi.function(),
          scrollBehavior: joi.function().arity(2),
          stringifyQuery: joi.function()
        });
      },

      default: {
        type: 'browser'
      }
    }
  });
  api.addProcessDone(() => (0, _updater.initUpdater)(api));
  api.onCodeGenerate(function () {
    genRoutes();
    watch({
      api,
      watchOpts: {
        path: (0, _path.resolve)(routesPath),
        keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
        onChange: genRoutes
      },
      onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` ${routesPath}`])
    });
  });
  /**
   * @multi 生成用户路由文件
   */

  function genRoutes() {
    const routes = (0, _getRoutes.default)({
      root: routesPath
    });
    (0, _mergeRoutes.default)(routes, api);
    (0, _writeRoutes.default)(routes, api);
  }
}