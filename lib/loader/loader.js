"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _updater = require("./updater");

/**
 * @file vue loader 自定义块处理 router-block
 */
function _default(source, map) {
  const updater = (0, _updater.getUpdater)(); // TODO: 把已经存在的 router block 删除不会触发 updater

  if (updater && map) {
    const file = map.file;
    updater({
      file,
      source
    });
  }

  return '';
}