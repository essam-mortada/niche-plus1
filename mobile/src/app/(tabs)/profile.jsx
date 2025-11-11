import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Package,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const handleConciergeService = () => {
    router.push("/concierge");
  };

  const handleSupplierAccess = () => {
    Alert.alert(
      "Supplier Access",
      "Would you like to become a supplier and start posting ads?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Learn More",
          onPress: () => router.push("/supplier/onboarding"),
        },
      ]
    );
  };

  const handleSettings = () => {
    console.log("Settings pressed");
  };

  const handleSupport = () => {
    console.log("Support pressed");
  };

  if (!fontsLoaded) {
    return null;
  }

  const profileActions = [
    {
      icon: Sparkles,
      title: "Concierge Service",
      subtitle: "Request luxury services",
      color: "#C6A15B",
      action: handleConciergeService,
    },
    /*
    {
      icon: Package,
      title: "Supplier Dashboard",
      subtitle: "Manage your listings",
      color: "#3B82F6",
      action: () => router.push("/supplier/dashboard"),
    },
    */
    {
      icon: Shield,
      title: "Admin Dashboard",
      subtitle: "Platform management",
      color: "#EF4444",
      action: () => router.push("/admin/dashboard"),
    },
    /*
    {
      icon: Settings,
      title: "Settings",
      subtitle: "Manage your preferences",
      color: "#6B7280",
      action: handleSettings,
    },
    */
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#111214" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "#111214",
          borderBottomWidth: 1,
          borderBottomColor: "#2A2D34",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 4,
          }}
        >
          Profile
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Your luxury experience awaits
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 24,
            marginTop: 20,
            marginBottom: 30,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#C6A15B20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <User size={32} color="#C6A15B" />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            Welcome to Niche+
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              textAlign: "center",
              lineHeight: 20,
              paddingHorizontal: 20,
            }}
          >
            Experience luxury design and architecture at your fingertips
          </Text>
        </View>

        {/* Action Items */}
        <Text
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          Services
        </Text>

        {profileActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.action}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${action.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <action.icon size={24} color={action.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 2,
                }}
              >
                {action.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                {action.subtitle}
              </Text>
            </View>

            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}

        {/* About Section */}
        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 12,
            }}
          >
            About Niche+
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            Niche+ is the premier luxury digital platform connecting discerning
            clients with exceptional design and architecture professionals
            worldwide.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#374151",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
              }}
            >
              Version 1.0.0
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#C6A15B",
              }}
            >
              © 2025 Niche Magazine
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}