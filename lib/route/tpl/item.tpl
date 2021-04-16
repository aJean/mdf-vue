{
  path: {{{path}}},
  {{#name}}
  name: {{{name}}},
  {{/name}}
  {{#redirect}}
  redirect: {{{redirect}}},
  {{/redirect}}
  {{#meta}}
  meta: {{{meta}}},
  {{/meta}}
  {{#props}}
  // @ts-ignore
  props: {{{ props}}},
  {{/props}}

  {{#component}}
  component: {{{component}}},
  {{/component}}

  {{#alias}}
  component: {{{alias}}},
  {{/alias}}

  {{#beforeEach}}
  beforeEach: {{{beforeEach}}},
  {{/beforeEach}}

  {{#afterEach}}
  afterEach: {{{afterEach}}},
  {{/afterEach}}

  {{#beforeEnter}}
  beforeEnter: {{{beforeEnter}}},
  {{/beforeEnter}}

  children: [
    {{#children}}
      {{> item}}
    {{/children}}
  ],
},
