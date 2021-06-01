"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entry;

var _utils = require("@mdfjs/utils");

var _path = require("path");

var _utils2 = require("../utils");

/**
 * @file 生成入口文件
 */
function entry(api) {
  const paths = api.paths,
        Mustache = api.Mustache;
  const _api$getConfig$histor = api.getConfig().history,
        type = _api$getConfig$histor.type,
        _api$getConfig$histor2 = _api$getConfig$histor.base,
        base = _api$getConfig$histor2 === void 0 ? '' : _api$getConfig$histor2;
  let historyFn = `createMemoryHistory('${base}')`;

  switch (type) {
    case 'hash':
      historyFn = `createWebHashHistory('${base}')`;
      break;

    case 'browser':
      historyFn = `createWebHistory('${base}')`;
      break;
  }

  api.onCodeGenerate(() => {
    const scrollBehavior = _utils2.mdfCache.getScrollBehavior();

    const tpl = api.getFile((0, _path.join)(__dirname, 'mdf.tpl'));
    const content = Mustache.render(tpl, {
      historyFn,
      scrollBehavior
    });
    api.writeFile(`${paths.absTmpPath}/mdf.ts`, (0, _utils.prettierFormat)(content));
  });
}