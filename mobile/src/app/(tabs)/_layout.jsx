import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, ShoppingBag, Award, BookOpen, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = true; // Always use dark theme for luxury feel

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111214", // Black theme
          borderTopWidth: 1,
          borderTopColor: "#2A2D34", // Slate border
          paddingTop: 8,
          paddingBottom: 8,
          height: 90,
        },
        tabBarActiveTintColor: "#C6A15B", // Gold accent
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="awards"
        options={{
          title: "Awards",
          tabBarIcon: ({ color, size }) => <Award color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="magazine"
        options={{
          title: "Magazine",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
