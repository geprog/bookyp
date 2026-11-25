import type { PublicSpace, Space } from '#shared/types/models';

export type CurrentSpace = Space | PublicSpace;

/** global state of the space that is currently opened (set by the space layout page) */
export function useCurrentSpaceState() {
  const currentSpaceId = useState<string | null>('space:id', () => null);
  const currentSpace = useState<CurrentSpace | null>('space:current', () => null);
  const { user } = useAuth();

  const isAdmin = computed(() => !!currentSpace.value && (currentSpace.value.role === 'admin' || !!user.value?.isSuperAdmin));
  const isMember = computed(() => !!currentSpace.value && (!!currentSpace.value.role || !!user.value?.isSuperAdmin));

  return { currentSpaceId, currentSpace, isAdmin, isMember };
}

export function isFullSpace(space: CurrentSpace | null | undefined): space is Space {
  return !!space && 'members' in space;
}

/** the space of the current route, only usable inside the space pages */
export function useCurrentSpace() {
  const { currentSpace, currentSpaceId, isAdmin, isMember } = useCurrentSpaceState();
  // the last loaded space is kept, so components of a page that is being left do not break
  const lastSpace = useState<CurrentSpace | null>('space:last', () => null);
  watch(currentSpace, (value) => {
    if (value) {
      lastSpace.value = value;
    }
  }, { immediate: true });
  const space = computed(() => {
    const value = currentSpace.value ?? lastSpace.value;
    if (!value) {
      throw new Error('useCurrentSpace must be used inside a space page');
    }
    return value;
  });
  const spaceId = computed(() => currentSpaceId.value ?? space.value._id);
  return { space, spaceId, isAdmin, isMember };
}
