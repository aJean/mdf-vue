import { createApp, h } from 'vue';
import * as VueRouter from 'vue-router';
import { PluginType } from 'mdf';
import routes from './routes';
import { plugin, config } from './plugins/plugin';

/**
 * @file vue entry
 */

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
