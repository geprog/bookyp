import type { RouteLocationRaw } from 'vue-router';

export interface AppHeaderConfig {
  title: string;
  /** route to go to when there is no history to go back to, `false` hides the back button */
  back?: RouteLocationRaw | false;
  /** keep the back button, but disable it */
  backDisabled?: boolean;
  /** render no header at all (404 page) */
  hidden?: boolean;
  /** which menus the page shows: desktop menu and mobile tab bar, the same without the space entry (plain), only the tab bar, or none (default: full) */
  menu?: 'full' | 'plain' | 'footer' | 'none';
  /** hide the header actions on small screens */
  actionsDesktopOnly?: boolean;
}

interface AppHeaderEntry {
  id: number;
  config: AppHeaderConfig;
}

let nextEntryId = 0;

/**
 * The header of the app shell is configured by the page that is shown.
 * Nested pages (e.g. the map editor and its sub pages) stack their configs: the innermost page wins
 * and the parent's config is restored when the sub page is left.
 * Actions on the right side are added with `<Teleport to="#app-header-actions">`.
 */
export function useAppHeader(config?: MaybeRefOrGetter<AppHeaderConfig>) {
  const stack = useState<AppHeaderEntry[]>('app:header', () => []);
  const header = computed<AppHeaderConfig>(() => stack.value[stack.value.length - 1]?.config ?? { title: '', back: false });

  if (config) {
    nextEntryId += 1;
    const id = nextEntryId;
    watch(() => toValue(config), (value) => {
      const entry = stack.value.find(e => e.id === id);
      if (entry) {
        entry.config = value;
      }
      else {
        stack.value.push({ id, config: value });
      }
    }, { immediate: true });
    onScopeDispose(() => {
      stack.value = stack.value.filter(e => e.id !== id);
    });
  }

  return { header };
}
