import { resolve as resolvePath } from 'path';
import { IApi, IJoi } from '@mdfjs/types';
import { chalkPrints } from '@mdfjs/utils';
import getRoutes from './getRoutes';
import mergeRoutes from './mergeRoutes';
import writeRoutes from './writeRoutes';
import { initUpdater } from '../loader/updater';
import { genRoutesPath } from '../utils';

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

  api.addProcessDone(() => initUpdater(api));
  api.onCodeGenerate(function () {
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
  });

  /**
   * @multi 生成用户路由文件
   */
  function genRoutes() {
    const routes = getRoutes({ root: routesPath });

    mergeRoutes(routes, api);
    writeRoutes(routes, api);
  }
}
