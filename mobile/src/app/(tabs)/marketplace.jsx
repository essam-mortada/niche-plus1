import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MapPin, MessageCircle, Filter } from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { apiGet } from "@/utils/api";

const { width: screenWidth } = Dimensions.get("window");

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet("/api/categories"),
  });

  // Fetch ads
  const {
    data: ads = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["approved-ads", selectedCategory],
    queryFn: () => {
      let url = "/api/ads?status=approved";
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      return apiGet(url);
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleWhatsApp = (phoneNumber) => {
    const url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp not installed",
          "Please install WhatsApp to contact this supplier.",
        );
      }
    });
  };

  const handleRequestQuote = (ad) => {
    Alert.alert(
      "Request Quote",
      `Would you like to request a quote for "${ad.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: () => console.log("Quote requested for:", ad.title),
        },
      ],
    );
  };

  const handleAdPress = (adId) => {
    router.push(`/marketplace/${adId}`);
  };

  if (!fontsLoaded) {
    return null;
  }

  const cardWidth = (screenWidth - 60) / 2;

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
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
            }}
          >
            Marketplace
          </Text>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#2A2D34",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Filter size={20} color="#C6A15B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <View style={{ paddingLeft: 20, paddingVertical: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 40 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === null ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: selectedCategory === null ? "#111214" : "#F7F7F5",
                }}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                  borderRadius: 20,
                  backgroundColor:
                    selectedCategory === category.id ? "#C6A15B" : "#2A2D34",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color:
                      selectedCategory === category.id ? "#111214" : "#F7F7F5",
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C6A15B"
            colors={["#C6A15B"]}
          />
        }
      >
        {ads.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {ads.map((ad) => (
              <TouchableOpacity
                key={ad.id}
                onPress={() => handleAdPress(ad.id)}
                style={{
                  width: cardWidth,
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  marginBottom: 20,
                  overflow: "hidden",
                }}
                activeOpacity={0.8}
              >
                {ad.images && ad.images.length > 0 && (
                  <Image
                    source={{ uri: ad.images[0] }}
                    style={{
                      width: "100%",
                      height: 140,
                    }}
                    contentFit="cover"
                    transition={300}
                  />
                )}

                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "PlayfairDisplay_700Bold",
                      color: "#F7F7F5",
                      marginBottom: 6,
                      lineHeight: 20,
                    }}
                    numberOfLines={2}
                  >
                    {ad.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      marginBottom: 8,
                      lineHeight: 16,
                    }}
                    numberOfLines={2}
                  >
                    {ad.short_description}
                  </Text>

                  {ad.price_label && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#C6A15B",
                        marginBottom: 8,
                      }}
                    >
                      {ad.price_label}
                    </Text>
                  )}

                  {ad.location && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <MapPin size={12} color="#6B7280" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                          marginLeft: 4,
                        }}
                      >
                        {ad.location}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRequestQuote(ad);
                      }}
                      style={{
                        backgroundColor: "#C6A15B",
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_600SemiBold",
                          color: "#111214",
                        }}
                      >
                        Request Quote
                      </Text>
                    </TouchableOpacity>

                    {ad.whatsapp_enabled && ad.whatsapp_number && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(ad.whatsapp_number);
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#C6A15B",
                          borderRadius: 8,
                          paddingVertical: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MessageCircle size={14} color="#C6A15B" />
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Inter_600SemiBold",
                            color: "#C6A15B",
                            marginLeft: 6,
                          }}
                        >
                          WhatsApp
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No Listings Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Check back soon for luxury lifestyle platform services
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
