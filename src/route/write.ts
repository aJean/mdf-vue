import { IApi } from '@mdfjs/types';
import { prettierFormat, errorPrint } from '@mdfjs/utils';
import { join } from 'path';
import { IRoute } from './find';

/**
 * @file 将收集到的 routes 写入 .tmp/routes.ts
 */

// 序列化 routes，将数据处理成便于文件写入的格式，主要是将函数处理为字符串
function routesSerialize(routes: IRoute[]) {
  function replacer(key: string, val: any) {
    if (typeof val === 'function') {
      let res = `${val}`;
      if (!res.includes('function')) {
        res = `function ${res}`;
      }
      return res;
    }

    return val;
  }

  routes.forEach(function forEach(route) {
    if (!route) {
      return;
    }

    Object.keys(route).forEach((key) => {
      if (key !== 'children') {
        const val = route[key];
        let isFunc = false;

        if (typeof val === 'function') {
          isFunc = true;
        }

        route[key] = JSON.stringify(val, replacer);

        if (isFunc) {
          route[key] = JSON.parse(route[key]);
        }
      } else if (route.children) {
        route.children.forEach(forEach);
      }
    });
  });

  return routes;
}

export default function writeRoutes(routes: IRoute[], api: IApi, file: string) {
  const { getFile, Mustache, paths } = api;
  Mustache.templateCache = undefined;

  try {
    const routesData = routesSerialize(routes);
    const tpl = getFile(join(__dirname, './tpl/routes.tpl'));
    const itemTpl = getFile(join(__dirname, './tpl/item.tpl'));
    const content = Mustache.render(tpl, { routes: routesData }, { item: itemTpl });

    // mustache partial
    api.writeFile(`${paths.absTmpPath}/${file}`, prettierFormat(content));
  } catch (e: any) {
    errorPrint(e);
    process.exit(1);
  }
}
