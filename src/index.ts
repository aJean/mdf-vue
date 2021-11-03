import { IApi } from '@mdfjs/types';
import vueChain from './compiler/chain';

/**
 * @file vue 插件集
 */

export default function (api: IApi) {
  // 增强 webpack chain
  vueChain(api);

  // 前置处理 multi，不能依赖 api.changeUserConfig
  const { project } = api.getConfig();
  const multi = project.multi || { index: 'pages' };
  // 路由、mdf 的生成都依赖这个元数据
  project.multi = Object.keys(multi).map((name) => {
    return {
      NAME: name,
      PAGES: multi[name],
      MDF_FILE: `mdf-${name}.ts`,
      ROUTES_FILE: `routes-${name}.ts`,
      ROUTES_IMPORT: `./routes/routes-${name}`,
      FILE: `${api.cwd}/.tmp/mdf-${name}.ts`,
    };
  });

  return { presets: [require.resolve('./route/route'), require.resolve('./mdf/mdf')] };
}

/**
 * es-lint config for vue
 */
export function lint(opts: any) {
  Object.assign(opts.rules, {
    'vue/comment-directive': 'error',
    'vue/jsx-uses-vars': 'error',
    'vue/script-setup-uses-vars': 'error',
    'vue/no-arrow-functions-in-watch': 'error',
    'vue/no-async-in-computed-properties': 'error',
    'vue/no-custom-modifiers-on-v-model': 'error',
    'vue/no-dupe-keys': 'error',
    'vue/no-dupe-v-else-if': 'error',
    'vue/no-duplicate-attributes': 'error',
    // 多个 root 节点
    // 'vue/no-multiple-template-root': 'error',
    'vue/no-mutating-props': 'error',
    'vue/no-parsing-error': 'error',
    'vue/no-reserved-keys': 'error',
    'vue/no-shared-component-data': 'error',
    'vue/no-side-effects-in-computed-properties': 'error',
    'vue/no-template-key': 'error',
    'vue/no-textarea-mustache': 'error',
    'vue/no-unused-components': 'error',
    'vue/no-unused-vars': 'error',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/no-v-for-template-key': 'error',
    'vue/no-v-model-argument': 'error',
    'vue/require-component-is': 'error',
    'vue/require-prop-type-constructor': 'error',
    'vue/require-render-return': 'error',
    'vue/require-v-for-key': 'error',
    // props 默认值设置，没必要必须是 function
    'vue/require-valid-default-prop': 'warn',
    'vue/return-in-computed-property': 'error',
    'vue/use-v-on-exact': 'error',
    'vue/valid-template-root': 'error',
    'vue/valid-v-bind-sync': 'error',
    'vue/valid-v-bind': 'error',
    'vue/valid-v-cloak': 'error',
    'vue/valid-v-else-if': 'error',
    'vue/valid-v-else': 'error',
    'vue/valid-v-for': 'error',
    'vue/valid-v-html': 'error',
    'vue/valid-v-if': 'error',
    'vue/valid-v-model': 'error',
    'vue/valid-v-on': 'error',
    'vue/valid-v-once': 'error',
    'vue/valid-v-pre': 'error',
    'vue/valid-v-show': 'error',
    'vue/valid-v-slot': 'error',
    'vue/valid-v-text': 'error',
    'vue/attributes-order': 'warn',
    'vue/component-tags-order': 'warn',
    'vue/no-lone-template': 'warn',
    'vue/no-multiple-slot-args': 'warn',
    'vue/no-v-html': 'warn',
    'vue/order-in-components': 'warn',
    'vue/this-in-template': 'warn',
    'vue/component-definition-name-casing': 'warn',
    'vue/html-closing-bracket-newline': 'warn',
    'vue/html-closing-bracket-spacing': 'warn',
    'vue/html-end-tags': 'warn',
    'vue/html-indent': 'warn',
    'vue/html-quotes': 'warn',
    // 自闭合标签
    'vue/html-self-closing': 'off',
    // 大写属性 -
    'vue/attribute-hyphenation': 'off',
    // 每行最大属性个数
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'warn',
    'vue/mustache-interpolation-spacing': 'warn',
    'vue/no-multi-spaces': 'warn',
    'vue/no-spaces-around-equal-signs-in-attribute': 'warn',
    'vue/no-template-shadow': 'warn',
    'vue/one-component-per-file': 'warn',
    'vue/prop-name-casing': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/require-explicit-emits': 'warn',
    'vue/require-prop-types': 'warn',
    // 换行闭合
    'vue/singleline-html-element-content-newline': 'off',
    'vue/v-bind-style': 'warn',
    'vue/v-on-style': 'warn',
    'vue/v-slot-style': 'warn',
  });

  return opts;
}

// api.addRuntimeExports(function () {
//   return {
//     all: true,
//     source: require.resolve('./exports'),
//   };
// });
