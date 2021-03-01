import { IApi } from '@mdfjs/types';
import { prettierFormat, errorPrint } from '@mdfjs/utils';
import { join } from 'path';
import { IRoute } from './getRoutes';

/**
 * @file writeRoutes
 */

// 序列化routes，将数据处理成便于文件写入的格式，主要是将函数处理为字符串
function routesSerialize(routes: IRoute[]) {
  function replacer(k: string, v: any) {
    if (typeof v === 'function') {
      let res = `${v}`;
      if (!res.includes('function')) {
        res = `function ${res}`;
      }
      return res;
    }
    return v;
  }

  routes.forEach(function forEach(route) {
    if (!route) return;
    Object.keys(route).forEach((k) => {
      if (k !== 'children') {
        const v = route[k];
        let isFunc = false;
        if (typeof v === 'function') {
          isFunc = true;
        }
        route[k] = JSON.stringify(v, replacer);
        if (isFunc) {
          route[k] = JSON.parse(route[k]);
        }
      } else if (route.children) {
        route.children.forEach(forEach);
      }
    });
  });

  return routes;
}

export default function writeRoutes(routes: IRoute[], api: IApi) {
  const { getFile, Mustache, paths } = api;

  try {
    const routesSer = routesSerialize(routes);
    const tpl = getFile(join(__dirname, './tpl/routes.tpl'));
    const itemTpl = getFile(join(__dirname, './tpl/item.tpl'));
    const content = Mustache.render(
      tpl,
      { routes: routesSer },
      {
        item: itemTpl,
      },
    );

    api.writeFile(`${paths.absTmpPath}/routes.ts`, prettierFormat(content));
  } catch (e) {
    errorPrint(e);
    process.exit(1);
  }
}
