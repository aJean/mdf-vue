"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _babel = _interopRequireDefault(require("./babel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 配置 @mdfjs/vue 的 webpack chain
 */
const _require = require('vue-loader/dist/index'),
      VueLoaderPlugin = _require.VueLoaderPlugin;

function _default(api) {
  const _api$getConfig = api.getConfig(),
        isDev = _api$getConfig.isDev;

  api.chainWebpack(chain => {
    const module = chain.module;
    module.rules.delete('babelJs');
    const tsRule = module.rule('vueJs').test(/\.(js|ts)$/).exclude.add(/node_modules/).end();
    const tsxRule = module.rule('vueTsx').test(/\.tsx$/).exclude.add(/node_modules/).end();

    const addLoader = ({
      name,
      loader,
      options
    }) => {
      tsRule.use(name).loader(loader).options(options);
      tsxRule.use(name).loader(loader).options(options);
    };

    addLoader({
      name: 'babelLoader',
      loader: require.resolve('babel-loader'),
      options: (0, _babel.default)({
        isDev
      })
    });
    addLoader({
      name: 'tsLoader',
      loader: require.resolve('ts-loader'),
      options: {
        // 使用 fork-ts-checker 做类型检查
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$']
      }
    });
    tsxRule.use('tsLoader').loader(require.resolve('ts-loader')).tap(options => {
      options = Object.assign({}, options);
      delete options.appendTsSuffixTo;
      options.appendTsxSuffixTo = ['\\.vue$'];
      return options;
    });
    module.rule('vueFile').test(/\.vue?$/).exclude.add(/node_modules/).end().use('vueLoader').loader(require.resolve('vue-loader')); // 解析自定 router block

    module.rule('router').resourceQuery(/blockType=router/).use('routerLoader').loader(require.resolve('../loader/loader'));
    chain.resolve.extensions.add('.vue');
    chain.plugin('vueLoadingPlugin').use(VueLoaderPlugin);
    chain.plugin('fork-ts-checker').use(require.resolve('fork-ts-checker-webpack-plugin'), [{
      typescript: {
        extensions: {
          vue: {
            enabled: true,
            compiler: require.resolve('@vue/compiler-sfc')
          }
        },
        diagnosticOptions: {
          semantic: true,
          syntactic: false
        }
      }
    }]);
  });
}