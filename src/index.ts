import { IApi, IJoi } from '@mdfjs/types';
import chain from './compiler/chain';

/**
 * @file vue 插件集
 */

export default function (api: IApi) {
  const { project } = api.getConfig();

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
