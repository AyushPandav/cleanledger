import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize } from '../../constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index',      title: 'Dashboard',   icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  { name: 'mystartup',  title: 'My Startup',  icon: 'rocket-outline',         activeIcon: 'rocket' },
  { name: 'fundusage',  title: 'Funds',       icon: 'cash-multiple',          activeIcon: 'cash-multiple' },
  { name: 'milestones', title: 'Milestones',  icon: 'flag-outline',           activeIcon: 'flag' },
  { name: 'profile',    title: 'Profile',     icon: 'account-outline',        activeIcon: 'account' },
];

export default function StartupLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.grayDark,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '500', marginTop: 2 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <MaterialCommunityIcons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
