"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chain = _interopRequireDefault(require("./compiler/chain"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file vue 插件集
 */
function _default(api) {
  // @todo: initPresets 阶段会取不到 default 的值
  api.describe({
    key: 'framework',
    config: {
      schema(joi) {
        return joi.object({
          type: joi.string(),
          root: joi.string()
        }).required();
      },

      default: {
        type: 'vuex'
      }
    }
  });
  api.changeUserConfig(config => {
    config.appEntry = `${api.cwd}/.tmp/mdf.ts`;
    return config;
  });
  (0, _chain.default)(api);
  const presets = [require.resolve('./route/route'), require.resolve('./mdf/mdf')];
  return {
    presets
  };
} // api.addRuntimeExports(function () {
//   return {
//     all: true,
//     source: require.resolve('./exports'),
//   };
// });