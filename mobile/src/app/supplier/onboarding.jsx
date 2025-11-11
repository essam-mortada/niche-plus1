import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Package,
  CreditCard,
  CheckCircle,
  Star,
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

export default function SupplierOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const handleGetStarted = () => {
    Alert.alert(
      "Supplier Registration",
      "This will redirect you to the supplier registration process. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => console.log("Redirect to supplier registration"),
        },
      ],
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  const features = [
    {
      icon: Package,
      title: "3 Ads Per Month",
      description:
        "Showcase your premium services with up to 3 marketplace listings",
    },
    {
      icon: Star,
      title: "Premium Placement",
      description: "Featured positioning in our luxury marketplace",
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description:
        "Professional review process ensures only the finest listings",
    },
    {
      icon: CreditCard,
      title: "Simple Billing",
      description: "Transparent $500/month pricing with easy Stripe management",
    },
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#2A2D34",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft size={20} color="#F7F7F5" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
              }}
            >
              Publisher Pack
            </Text>
          </View>

          <Package size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Join Niche+ as a luxury service provider and reach discerning clients
          worldwide.
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
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
              marginBottom: 20,
            }}
          >
            <Package size={40} color="#C6A15B" />
          </View>

          <Text
            style={{
              fontSize: 28,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            $500
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
              }}
            >
              /month
            </Text>
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            Everything you need to showcase your luxury services to the right
            audience
          </Text>

          <View
            style={{
              backgroundColor: "#C6A15B20",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                color: "#C6A15B",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Premium Membership
            </Text>
          </View>
        </View>

        {/* Features */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          What's Included
        </Text>

        {features.map((feature, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#C6A15B20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
                marginTop: 2,
              }}
            >
              <feature.icon size={20} color="#C6A15B" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 4,
                }}
              >
                {feature.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                  lineHeight: 20,
                }}
              >
                {feature.description}
              </Text>
            </View>
          </View>
        ))}

        {/* How It Works */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginTop: 20,
            marginBottom: 16,
          }}
        >
          How It Works
        </Text>

        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            1. Subscribe to the Publisher Pack ($500/month){"\n"}
            2. Create up to 3 premium ad listings{"\n"}
            3. Submit for professional review{"\n"}
            4. Go live for 30 days once approved{"\n"}
            5. Connect with luxury clients directly
          </Text>

          <View
            style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#374151",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#C6A15B",
                textAlign: "center",
              }}
            >
              Credits reset monthly • No long-term contracts
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Get Started Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
          backgroundColor: "#111214",
          borderTopWidth: 1,
          borderTopColor: "#2A2D34",
        }}
      >
        <TouchableOpacity
          onPress={handleGetStarted}
          style={{
            backgroundColor: "#C6A15B",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#111214",
            }}
          >
            Get Started Today
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Start your 30-day trial • Cancel anytime
        </Text>
      </View>
    </View>
  );
}
