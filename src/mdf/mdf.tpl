import { createApp, h } from 'vue';
import * as VueRouter from 'vue-router';
import { PluginType } from 'mdf';
import routes from './routes';
import { plugin, config } from './plugins/plugin';

/**
 * @file vue entry
 */

plugin.invoke({ key: 'beforeRender', type: PluginType.event, args: [config] });

const router = VueRouter.createRouter({
  history: VueRouter.{{{ historyFn }}},
  routes: routes
});

const app = createApp({
  render: () => h(VueRouter.RouterView)
});
app.use(router).mount('#root');
