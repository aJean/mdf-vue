"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mergeConfig;

var _compilerSfc = require("@vue/compiler-sfc");

var _vm = require("vm");

var _fs = require("fs");

var _utils = require("../utils");

/**
 * @file 首次启动编译，需要自己合并 router block 配置，运行时依赖 vue loader
 */
function getOptions(route, api) {
  let filename = route.componentPath;

  if (!filename) {
    return route;
  }

  const content = (0, _fs.readFileSync)(filename, {
    encoding: 'utf-8'
  });
  const res = (0, _compilerSfc.parse)(content, {
    sourceMap: false,
    filename
  });
  let routerBlock = res.descriptor.customBlocks.find(item => item.type === 'router');

  if (!routerBlock) {
    return (0, _utils.assignRoute)(route);
  }

  const code = routerBlock.content;

  if (!/\{[\s\S]*\}/m.test(code)) {
    console.warn(`${filename} <router> 自定块必须是一个对象字符串,传入的是：${code}`);
    return route;
  }

  const context = (0, _vm.createContext)({
    temp: {}
  });

  try {
    (0, _vm.runInContext)(`temp=${code}`, context);
  } catch (error) {
    console.error(error);
  }

  (0, _utils.assignRoute)(route, context.temp);
  return route;
}

function mergeConfig(routes, api) {
  for (let index = 0; index < routes.length; index++) {
    let route = routes[index];
    route = getOptions(route, api);

    if (route.children) {
      route.children = mergeConfig(route.children, api);
    }
  }

  return routes;
}