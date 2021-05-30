### vue 工程模块
为 mdf 提供 vue 方向技术栈的支持

#### todos
- block updater 路径一致比较能否简化
- 支持 vuex

#### vite
使用 vite 替代 webpack dev 的可行性
- 问题是 vite 的插件是基于 rollup 体系的，与 tapable 规范不一样
- dev 使用 vite，build 使用 webpack，就要维护两套 chain 的机制？？

#### 替换 css rules
``` javascript
const loader = module.rule('sass').oneOf('css-modules').use('styleLoader');
// 替换 style loader
if (loader.values().length) {
   loader.loader(require.resolve('vue-style-loader'));
}

console.log((chain.toConfig() as any).module.rules[5])
console.log((chain.toConfig() as any).module.rules[5].oneOf[0].use)
```
