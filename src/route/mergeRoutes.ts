import { IApi } from '@mdfjs/types';
import { parse } from '@vue/compiler-sfc';
import { runInContext, createContext } from 'vm';
import { readFileSync } from 'fs';
import { IRoute } from './getRoutes';

/**
 * @file 首次启动编译，需要自己合并 router block 配置，运行时依赖 vue loader
 */

function getOptions(route: IRoute, api: IApi) {
  let filename = route.componentPath!;

  if (!filename) {
    return route;
  }

  const content = readFileSync(filename, { encoding: 'utf-8' });

  const res = parse(content!, {
    sourceMap: false,
    filename,
  });

  let routerBlock = res.descriptor.customBlocks.find((item) => item.type === 'router');
  if (!routerBlock) return route;
  let code = routerBlock.content;

  if (!/\{[\s\S]*\}/m.test(code)) {
    console.warn(`${filename} <router> 自定块必须是一个对象字符串,传入的是：${code}`);
    return route;
  }

  const context = createContext({ temp: {} });
  try {
    runInContext(`temp=${code}`, context);
  } catch (error) {
    console.error(error);
  }

  Object.assign(route, context.temp);
  return route;
}

export default function mergeConfig(routes: IRoute[], api: IApi) {
  for (let index = 0; index < routes.length; index++) {
    let route = routes[index];
    route = getOptions(route, api);

    if (route.children) {
      route.children = mergeConfig(route.children, api);
    }
  }

  return routes;
}
