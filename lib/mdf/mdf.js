"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entry;

var _utils = require("@mdfjs/utils");

var _path = require("path");

/**
 * @file 生成入口文件
 */
function entry(api) {
  const paths = api.paths,
        Mustache = api.Mustache;
  const _api$getConfig$histor = api.getConfig().history,
        type = _api$getConfig$histor.type,
        base = _api$getConfig$histor.base;
  let historyFn = '';

  switch (type) {
    case 'hash':
      historyFn = `createWebHashHistory('${base}')`;
      break;

    case 'browser':
      historyFn = `createWebHistory('${base}')`;
      break;

    default:
      historyFn = `createMemoryHistory('${base}')`;
  }

  api.onCodeGenerate(() => {
    const tpl = api.getFile((0, _path.join)(__dirname, 'mdf.tpl'));
    const content = Mustache.render(tpl, {
      historyFn
    });
    api.writeFile(`${paths.absTmpPath}/mdf.ts`, (0, _utils.prettierFormat)(content));
  });
}