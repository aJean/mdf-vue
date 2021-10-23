"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _find = _interopRequireDefault(require("./find"));

var _merge = _interopRequireDefault(require("./merge"));

var _write = _interopRequireDefault(require("./write"));

var _updater = require("../loader/updater");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 根据文件结构生成路由配置
 */
function routes(api) {
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
  }); // 加载 block updater，因为在 done 后才执行不会影响 build

  api.addProcessDone(() => (0, _updater.initUpdater)(api));
  api.onCodeGenerate({
    name: 'genVueRoutes',

    fn() {
      const root = (0, _utils.genStaticPath)(api); // @ts-ignore

      api.fromMeta(meta => {
        const watch = api.createWatchFn(); // 多入口监听

        const dir = `${root}/${meta.PAGES}`; // 生成路由配置

        const genRoutes = () => {
          const routes = (0, _find.default)({
            root,
            pageDir: meta.PAGES
          });
          (0, _merge.default)(routes, api);
          (0, _write.default)(routes, api, meta.ROUTES_FILE);
        };

        genRoutes();
        watch({
          api,
          watchOpts: {
            path: (0, _path.resolve)(dir),
            keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
            onChange: genRoutes
          },
          onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` ${dir}`])
        });
      });
    }

  });
}