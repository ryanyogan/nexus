/// <reference types="vitepress/client" />

// Vue SFC type declarations
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// CSS module type declarations
declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
