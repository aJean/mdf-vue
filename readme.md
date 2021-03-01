### todos
- updater 路径一致比较能否简化
- 支持 vuex
- 提取 history 传入 beforeRender

### vite
使用 vite 替代 webpack dev 的可行性
- 问题是 vite 的插件是基于 rollup 体系的，与 tapable 规范不一样
- dev 使用 vite，build 使用 webpack，就要维护两套 chain 的机制？？