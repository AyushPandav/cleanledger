import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize } from '../../constants/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const iconMap: Record<string, string> = {
    Home: 'home-outline',
    Browse: 'magnify',
    Portfolio: 'briefcase-outline',
    Startup: 'rocket-outline',
  };

  return (
    <View style={styles.tabIconContainer}>
      <MaterialCommunityIcons 
        name={iconMap[label] as any}
        size={24}
        color={focused ? colors.green : colors.grayDark}
        style={styles.tabIcon}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.grayDark,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => <TabIcon label="Browse" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ focused }) => <TabIcon label="Portfolio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="startup"
        options={{
          title: 'Startup',
          tabBarIcon: ({ focused }) => <TabIcon label="Startup" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginBottom: 4,
  },
});
