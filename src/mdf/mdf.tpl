import { createApp, h } from 'vue';
import * as VueRouter from 'vue-router';
import { PluginType } from 'mdf';
import { plugin, config } from './plugins/plugin';
import routes from '{{{ routesPath }}}';

/**
 * @file {{{ entryName }}}.html
 */

// app 增强配置
{{#appPath}}
plugin.registerPlugin(require('{{{ appPath }}}').default);
{{/appPath}}

const router = VueRouter.createRouter({
  history: VueRouter.{{{ historyFn }}},
  routes: routes as any,
  {{#scrollCache}}
  // @ts-ignore
  {{{ scrollCache.fn }}},
  {{/scrollCache}}
});

const app = createApp({
  render: () => h(VueRouter.RouterView)
});

app['router'] = router;
plugin.invoke({ key: 'beforeRender', type: PluginType.event, args: [config, app] });
app.use(router).mount('#root');
