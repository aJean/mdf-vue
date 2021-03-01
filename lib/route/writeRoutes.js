"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = writeRoutes;

var _utils = require("@mdfjs/utils");

var _path = require("path");

/**
 * @file writeRoutes
 */
// 序列化routes，将数据处理成便于文件写入的格式，主要是将函数处理为字符串
function routesSerialize(routes) {
  function replacer(k, v) {
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
    Object.keys(route).forEach(k => {
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

function writeRoutes(routes, api) {
  const getFile = api.getFile,
        Mustache = api.Mustache,
        paths = api.paths;

  try {
    const routesSer = routesSerialize(routes);
    const tpl = getFile((0, _path.join)(__dirname, './tpl/routes.tpl'));
    const itemTpl = getFile((0, _path.join)(__dirname, './tpl/item.tpl'));
    const content = Mustache.render(tpl, {
      routes: routesSer
    }, {
      item: itemTpl
    });
    api.writeFile(`${paths.absTmpPath}/routes.ts`, (0, _utils.prettierFormat)(content));
  } catch (e) {
    (0, _utils.errorPrint)(e);
    process.exit(1);
  }
}