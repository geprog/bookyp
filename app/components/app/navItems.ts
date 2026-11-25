import type { RouteLocationRaw } from 'vue-router';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  to: RouteLocationRaw;
  active: boolean;
  spot?: boolean;
  dataTest?: string;
}
