import type { User } from '#shared/types/models';

export type CurrentUser = User & { isSuperAdmin: boolean };

/**
 * The logged in user. The session cookie is managed by nuxt-auth-utils, the user
 * document (with starred spaces etc.) is loaded from the api.
 */
export function useAuth() {
  const session = useUserSession();
  const user = useState<CurrentUser | null>('auth:user', () => null);
  const loaded = useState<boolean>('auth:loaded', () => false);

  async function refreshUser(): Promise<void> {
    try {
      const result = await $fetch<{ user: CurrentUser | null }>('/api/me');
      // the user is refreshed on every navigation, an unchanged user keeps its object so watchers do not fire
      if (JSON.stringify(result.user) !== JSON.stringify(user.value)) {
        user.value = result.user;
      }
    }
    catch (error) {
      // a network problem during a navigation does not log the user out
      if (!loaded.value) {
        user.value = null;
      }
      console.error(error);
    }
    finally {
      loaded.value = true;
    }
  }

  const loggedIn = computed(() => !!user.value);

  function login(redirect?: string): void {
    const target = redirect ?? useRoute().fullPath;
    window.location.href = `/api/auth/login?redirect=${encodeURIComponent(target)}`;
  }

  async function logout(): Promise<void> {
    const { savedSpaceId } = useSavedSpace();
    savedSpaceId.value = null;
    await session.clear();
    user.value = null;
    window.location.href = '/api/auth/logout';
  }

  async function updateUser(data: Partial<Pick<User, 'starredSpaces'>>): Promise<void> {
    user.value = await $fetch<CurrentUser>('/api/me', { method: 'PATCH', body: data });
  }

  function isStarred(spaceId: string): boolean {
    return user.value?.starredSpaces?.includes(spaceId) ?? false;
  }

  async function toggleStar(spaceId: string): Promise<void> {
    if (!user.value) {
      return;
    }
    const starred = user.value.starredSpaces ?? [];
    await updateUser({
      starredSpaces: starred.includes(spaceId) ? starred.filter(id => id !== spaceId) : [...starred, spaceId],
    });
  }

  return { user, loggedIn, loaded, refreshUser, login, logout, updateUser, isStarred, toggleStar };
}
