import { resolve as resolvePath } from 'path';
import { IApi, IJoi } from '@mdfjs/types';
import { chalkPrints, genRoutesPath } from '@mdfjs/utils';
import findRoutes from './find';
import mergeRoutes from './merge';
import writeRoutes from './write';
import { initUpdater } from '../loader/updater';

/**
 * @file 根据文件结构生成路由配置
 */

export default function routes(api: IApi) {
  const watch = api.createWatchFn();
  const routesPath = genRoutesPath(api);

  api.describe({
    key: 'history',
    config: {
      schema(joi: IJoi) {
        return joi.object({
          type: joi.string().allow('browser', 'hash', 'memory'),
          base: joi.string(),
          linkActiveClass: joi.string(),
          linkExactActiveClass: joi.string(),
          parseQuery: joi.function(),
          scrollBehavior: joi.function().arity(2),
          stringifyQuery: joi.function(),
        });
      },

      default: {
        type: 'browser',
      },
    },
  });

  // 加载 block updater，因为在 done 后才执行不会影响 build
  api.addProcessDone(() => initUpdater(api));

  api.onCodeGenerate({
    name: 'genVueRoutes',
    fn() {
      genRoutes();

      watch({
        api,
        watchOpts: {
          path: resolvePath(routesPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
          onChange: genRoutes,
        },
        onExit: () => chalkPrints([['unwatch:', 'yellow'], ` ${routesPath}`]),
      });
    },
  });

  /**
   * 生成用户路由文件
   */
  function genRoutes() {
    const routes = findRoutes({ root: routesPath.replace('/pages', '') });

    mergeRoutes(routes, api);
    writeRoutes(routes, api);
  }
}
