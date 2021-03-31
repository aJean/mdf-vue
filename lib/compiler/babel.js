"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getBabelOpts;

var _path = require("path");

/**
 * @file babel vue
 */
function getBabelOpts({
  isDev = false,
  isTest = false
}) {
  const presets = [];
  const plugins = [];

  if (isTest) {
    presets.push([require.resolve('@babel/preset-env'), {
      targets: {
        node: 'current'
      }
    }]);
  } else {
    presets.push([require.resolve('@babel/preset-env'), {
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false // 为 tree-shaking 保留 esmodule 的 import

    }]);
  }

  plugins.push(require.resolve('@vue/babel-plugin-jsx')); // 默认配置 { corejs: false, helpers: true, regenerator: true }

  plugins.push([require.resolve('@babel/plugin-transform-runtime'), {
    version: require('@babel/runtime/package.json').version,
    absoluteRuntime: (0, _path.dirname)(require.resolve('@babel/runtime/package.json')),
    useESModules: true
  }]);
  plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'));
  plugins.push([require.resolve('@babel/plugin-proposal-decorators'), {
    legacy: true
  }]);
  plugins.push([require.resolve('@babel/plugin-proposal-class-properties'), {
    loose: true
  }]);
  return {
    cacheDirectory: true,
    presets,
    plugins
  };
}