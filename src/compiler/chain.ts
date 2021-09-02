import { IApi } from '@mdfjs/types';
import geBabelOpts from './babel';

/**
 * @file 配置 @mdfjs/vue 的 webpack chain
 */

const { VueLoaderPlugin } = require('vue-loader/dist/index');
export default function (api: IApi) {
  const { isDev } = api.getConfig();

  api.chainWebpack((chain) => {
    const module = chain.module;
    module.rules.delete('babelJs');

    // .vue
    chain.resolve.extensions.add('.vue');

    const tsRule = module
      .rule('vueJs')
      .test(/\.(js|ts)$/)
      .exclude.add(/node_modules/)
      .end();

    const tsxRule = module
      .rule('vueTsx')
      .test(/\.tsx$/)
      .exclude.add(/node_modules/)
      .end();

    const addLoader = ({ name, loader, options }: any) => {
      tsRule.use(name).loader(loader).options(options);
      tsxRule.use(name).loader(loader).options(options);
    };

    addLoader({
      name: 'babelLoader',
      loader: require.resolve('babel-loader'),
      options: geBabelOpts({ isDev }),
    });

    addLoader({
      name: 'tsLoader',
      loader: require.resolve('ts-loader'),
      options: {
        // 使用 fork-ts-checker 做类型检查
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
      },
    });

    tsxRule
      .use('tsLoader')
      .loader(require.resolve('ts-loader'))
      .tap((options: any) => {
        options = Object.assign({}, options);
        delete options.appendTsSuffixTo;
        options.appendTsxSuffixTo = ['\\.vue$'];
        return options;
      });

    module
      .rule('vueFile')
      .test(/\.vue?$/)
      .exclude.add(/node_modules/)
      .end()
      .use('vueLoader')
      .loader(require.resolve('vue-loader'));

    // 解析自定 router block
    module
      .rule('router')
      .resourceQuery(/blockType=router/)
      .use('routerLoader')
      .loader(require.resolve('../loader/loader'));

    chain.plugin('vueLoadingPlugin').use(VueLoaderPlugin);

    chain.plugin('fork-ts-checker').use(require.resolve('fork-ts-checker-webpack-plugin'), [
      {
        logger: {
          infrastructure: 'silent',
          issues: 'webpack-infrastructure',
          devServer: true,
        },

        typescript: {
          extensions: {
            vue: {
              enabled: true,
              compiler: require.resolve('@vue/compiler-sfc'),
            },
          },

          diagnosticOptions: {
            semantic: true,
            syntactic: false,
          },
        },
      },
    ]);
  });
}
