import { resolve as resolvePath } from 'path';
import { IApi, IJoi } from '@mdfjs/types';
import { chalkPrints, genStaticPath } from '@mdfjs/utils';
import findRoutes from './find';
import mergeRoutes from './merge';
import writeRoutes from './write';
import { initUpdater } from '../loader/updater';

/**
 * @file 根据文件结构生成路由配置
 */

export default function routes(api: IApi) {
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
      const root = genStaticPath(api);

      api.fromMeta((meta) => {
        const watch = api.createWatchFn();
        // 多入口监听
        const dir = `${root}/${meta.PAGES}`;
        // 生成路由配置
        const genRoutes = () => {
          const routes = findRoutes({ root, pageDir: meta.PAGES });

          mergeRoutes(routes, api);
          writeRoutes(routes, api, meta.ROUTES_FILE);
        };

        genRoutes();

        watch({
          api,
          watchOpts: {
            path: resolvePath(dir),
            keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
            onChange: genRoutes,
          },
          onExit: () => chalkPrints([['unwatch:', 'yellow'], ` ${dir}`]),
        });
      });
    },
  });
}
