import { IApi, IJoi } from '@mdfjs/types';
import chain from './compiler/chain';

/**
 * @file vue 插件集
 */

export default function (api: IApi) {
  // @todo: initPresets 阶段会取不到 default 的值
  api.describe({
    key: 'framework',

    config: {
      schema(joi: IJoi) {
        return joi
          .object({
            type: joi.string(),
            root: joi.string(),
          })
          .required();
      },

      default: { type: 'vuex' },
    },
  });

  api.changeUserConfig((config: any) => {
    config.appEntry = `${api.cwd}/.tmp/mdf.ts`;
    return config;
  });

  chain(api);

  const presets = [require.resolve('./route/route'), require.resolve('./mdf/mdf')];
  return { presets };
}

// api.addRuntimeExports(function () {
//   return {
//     all: true,
//     source: require.resolve('./exports'),
//   };
// });
