import type { NavItem } from '~/components/app/navItems';

/**
 * The entries of the main navigation (desktop menu and mobile tab bar).
 * Inside a space an additional entry for the space info (users) or the admin area (admins) is shown.
 */
export function useNavItems() {
  const { t } = useI18n();
  const route = useRoute();
  const { hasOngoingBooking } = useOngoingBookings();
  const { currentSpaceId, isAdmin } = useCurrentSpaceState();

  const items = computed<NavItem[]>(() => {
    const path = route.path;
    const isSpacesMap = path.startsWith('/spaces/map');
    const list: NavItem[] = [
      {
        key: 'explore',
        label: t('explore'),
        icon: 'magnifying-glass',
        to: isSpacesMap ? '/spaces/map' : '/spaces',
        // v1 highlighted the entry only on the exact spaces list route
        active: path === '/spaces',
        dataTest: 'spaces-button',
      },
      {
        key: 'bookings',
        label: t('bookings'),
        icon: 'ticket',
        to: '/account/bookings',
        active: path === '/account/bookings' || path.startsWith('/account/booking/'),
        spot: hasOngoingBooking.value,
        dataTest: 'bookings-button',
      },
    ];

    if (currentSpaceId.value) {
      const spacePath = `/space/${currentSpaceId.value}`;
      if (isAdmin.value) {
        list.push({
          key: 'admin',
          label: t('roles.admin.name'),
          icon: 'settings',
          to: `${spacePath}/settings`,
          // the same (partly outdated) path list v1 used to highlight the admin entry
          active: path === `${spacePath}/settings`
            || ['/bookings/calendar', 'bookings/members', '/settings/map-editor', '/settings/bookable', 'settings/member', 'settings/info', 'settings/subscription'].some(part => path.includes(part)),
          dataTest: 'button-settings',
        });
      }
      else {
        list.push({
          key: 'info',
          label: t('info'),
          icon: 'info',
          to: `${spacePath}/info`,
          active: path === `${spacePath}/info`,
          dataTest: 'button-space-info',
        });
      }
    }

    list.push({
      key: 'profile',
      label: t('profile'),
      icon: 'person',
      to: '/account',
      active: path.startsWith('/account') && !path.startsWith('/account/booking'),
      dataTest: 'profile-button',
    });
    return list;
  });

  return { items };
}
