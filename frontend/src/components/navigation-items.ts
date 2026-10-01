import {
  BottomNavHomeIcon,
  BottomNavLearnIcon,
  BottomNavProfileIcon,
  BottomNavStatsIcon,
} from '@/shared/design';

export const navigationItems = [
  { path: '/dashboard', label: 'Нүүр', Icon: BottomNavHomeIcon },
  { path: '/analytics', label: 'Ахиц', Icon: BottomNavStatsIcon },
  { path: '/learn', label: 'Суръя', Icon: BottomNavLearnIcon },
  { path: '/profile', label: 'Профайл', Icon: BottomNavProfileIcon },
];
