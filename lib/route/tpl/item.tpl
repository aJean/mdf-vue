{
  path: {{{path}}},

  {{#name}}
  name: {{{name}}},
  {{/name}}

  {{#component}}
  component: {{{component}}},
  {{/component}}

  {{#alias}}
  component: {{{alias}}},
  {{/alias}}

  {{#meta}}
  meta: {{{meta}}},
  {{/meta}}

  {{#redirect}}
  redirect: {{{redirect}}},
  {{/redirect}}

   children: [
    {{#children}}
      {{> item}}
    {{/children}}
   ],

  {{#props}}
  // @ts-ignore
  props: {{{ props}}},
  {{/props}}


   {{#beforeEnter}}
   beforeEnter: {{{beforeEnter}}},
   {{/beforeEnter}}
},
