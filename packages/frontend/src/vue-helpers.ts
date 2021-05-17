import { Component, ComponentOptionsBase, FunctionalComponent, PropType } from 'vue';

// ----------------------
// Component PropType extraction inspired by https://github.com/vuejs/vue-next/pull/2179
// TODO: Replace when PR is merged and release published, planned for vue@3.2
// ----------------------
type EnsureNonVoid<T> = T extends void ? Record<string, never> : T;

type CreateComponentProps<P, Defaults, PublicP = EnsureNonVoid<P>, PublicDefaults = EnsureNonVoid<Defaults>> = Readonly<
  Partial<PublicDefaults> & Omit<PublicP, keyof PublicDefaults>
>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ComponentProps<C extends Component<any, any>> = C extends ComponentOptionsBase<
  infer P,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer Defaults
>
  ? CreateComponentProps<P, Defaults>
  : C extends FunctionalComponent<infer P, any>
  ? Readonly<P>
  : Record<string, never>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type ExtractedComponentProp<C extends Component, P extends keyof ComponentProps<C>> = PropType<
  ComponentProps<C>[P]
>;
