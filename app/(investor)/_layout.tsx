import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize } from '../../constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'explore', title: 'Explore', icon: 'magnify', activeIcon: 'magnify' },
  { name: 'investments', title: 'Investments', icon: 'trending-up', activeIcon: 'trending-up' },
  { name: 'portfolio', title: 'Portfolio', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { name: 'community', title: 'Community', icon: 'account-group-outline', activeIcon: 'account-group' },
  { name: 'profile', title: 'Profile', icon: 'account-outline', activeIcon: 'account' },
];

export default function InvestorLayout() {
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
      <Tabs.Screen name="compare" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
    </Tabs>
  );
}
