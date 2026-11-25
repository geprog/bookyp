const prefix = 'bookyp.';

/** remembers the last opened space (and the five most recently viewed ones) in local storage */
export function useSavedSpace() {
  const savedSpaceId = useLocalStorage<string | null>(`${prefix}spaceId`, null, { writeDefaults: false });
  const recentlyViewedSpaces = useLocalStorage<Record<string, number>>(`${prefix}recently_viewed_spaces`, {});

  function rememberSpace(spaceId: string): void {
    savedSpaceId.value = spaceId;
    const entries = Object.entries({ ...recentlyViewedSpaces.value, [spaceId]: Date.now() })
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    recentlyViewedSpaces.value = Object.fromEntries(entries);
  }

  return { savedSpaceId, recentlyViewedSpaces, rememberSpace };
}
