"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entry;
exports.genMdf = genMdf;

var _utils = require("@mdfjs/utils");

var _path = require("path");

var _utils2 = require("../utils");

/**
 * @file 生成入口文件
 *       这里有一个标准认知：index == spa == mpa 默认首页
 */
function entry(api) {
  api.onCodeGenerate({
    name: 'genVue',

    fn() {
      genMdf(api);
    }

  });
}

function genMdf(api) {
  const paths = api.paths,
        Mustache = api.Mustache;

  const _api$getConfig = api.getConfig(),
        history = _api$getConfig.history;

  const tpl = api.getFile((0, _path.join)(__dirname, 'mdf.tpl')); // 路由类型

  const genHistory = path => {
    const type = history.type,
          _history$base = history.base,
          base = _history$base === void 0 ? '' : _history$base;
    const prefix = path ? `${base}/${path}` : base;
    let historyFn = `createWebHistory('${prefix}')`;

    switch (type) {
      case 'hash':
        historyFn = `createWebHashHistory('${prefix}')`;
        break;

      case 'memo':
        historyFn = `createMemoryHistory('${prefix}')`;
        break;
    }

    return historyFn;
  }; // 此时 multi 已经被写入 META data


  api.fromMeta(meta => {
    const name = meta.NAME;
    const content = Mustache.render(tpl, {
      entryName: name,
      historyFn: genHistory(name != 'index' && name),
      scrollCache: _utils2.mdfCache.getScrollCache(),
      routesPath: meta.ROUTES_IMPORT,
      appPath: findAppFile(paths.absSrcPath, name)
    });
    api.writeFile(`${paths.absTmpPath}/${meta.MDF_FILE}`, (0, _utils.prettierFormat)(content));
  });
  /**
   * 查找项目配置文件，可以共用 app.ts
   */

  function findAppFile(prefix, name) {
    const paths = [`${prefix}/client/app-${name}.ts`, `${prefix}/app-${name}.ts`, `${prefix}/client/app.ts`, `${prefix}/app.ts`];

    while (paths.length) {
      const path = paths.shift();

      if (api.isExist(path)) {
        return path;
      }
    }

    return undefined;
  }
}