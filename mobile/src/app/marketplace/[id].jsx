import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Building,
  Tag,
  MessageSquare,
  Phone,
  Eye,
  Clock,
  ExternalLink,
} from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

export default function MarketplaceAdDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch marketplace ad details
  const { data: ad, isLoading } = useQuery({
    queryKey: ["marketplace-ad", id],
    queryFn: async () => {
      const response = await fetch(`/api/ads/${id}`);
      if (!response.ok) throw new Error("Failed to fetch ad");
      return response.json();
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${ad?.title}\n\n${ad?.short_desc}`,
        title: ad?.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRequestQuote = () => {
    if (!ad?.supplier) {
      Alert.alert("Error", "Supplier information not available");
      return;
    }

    router.push({
      pathname: "/concierge",
      params: {
        subject: `Quote Request: ${ad.title}`,
        supplierId: ad.supplier.id,
        adId: ad.id,
      },
    });
  };

  const handleWhatsApp = async () => {
    if (!ad?.whatsapp_number) {
      Alert.alert("Error", "WhatsApp contact not available");
      return;
    }

    const message = encodeURIComponent(
      `Hi! I'm interested in your listing: ${ad.title}`,
    );
    const whatsappUrl = `https://wa.me/${ad.whatsapp_number}?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  };

  const handleViewSupplier = () => {
    if (ad?.supplier?.id) {
      router.push(`/supplier/${ad.supplier.id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#22C55E";
      case "pending":
        return "#F59E0B";
      case "expired":
        return "#6B7280";
      default:
        return "#C6A15B";
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Loading listing...
        </Text>
      </View>
    );
  }

  if (!ad) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Listing Not Found
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          The listing you're looking for doesn't exist or has been removed.
        </Text>
      </View>
    );
  }

  const mainImage = ad.media && ad.media.length > 0 ? ad.media[0] : null;
  const additionalImages =
    ad.media && ad.media.length > 1 ? ad.media.slice(1) : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#111214" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(17, 18, 20, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="#F7F7F5" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(17, 18, 20, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Share2 size={18} color="#F7F7F5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        {mainImage && (
          <Image
            source={{ uri: mainImage.url || mainImage }}
            style={{
              width: "100%",
              height: 280,
            }}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Status Badge & Category */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: `${getStatusColor(ad.status)}20`,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: getStatusColor(ad.status),
                  textTransform: "capitalize",
                }}
              >
                {ad.status}
              </Text>
            </View>

            {ad.category && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#2A2D34",
                  borderRadius: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Tag size={12} color="#C6A15B" />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#C6A15B",
                    marginLeft: 4,
                  }}
                >
                  {ad.category.name}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              lineHeight: 32,
              marginBottom: 12,
            }}
          >
            {ad.title}
          </Text>

          {/* Price & Location */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {ad.price_label && (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#C6A15B",
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
                }}
              >
                <MapPin size={14} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    marginLeft: 4,
                  }}
                >
                  {ad.location}
                </Text>
              </View>
            )}
          </View>

          {/* Supplier Info */}
          {ad.supplier && (
            <TouchableOpacity
              onPress={handleViewSupplier}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              {ad.supplier.logo && (
                <Image
                  source={{ uri: ad.supplier.logo }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 12,
                    backgroundColor: "#111214",
                  }}
                  contentFit="cover"
                />
              )}

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Building size={14} color="#C6A15B" />
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginLeft: 6,
                    }}
                  >
                    {ad.supplier.company_name || "Supplier"}
                  </Text>
                </View>
                {ad.supplier.bio && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {ad.supplier.bio}
                  </Text>
                )}
              </View>

              <ExternalLink size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Short Description */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay_400Regular",
              color: "#C6A15B",
              lineHeight: 24,
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            {ad.short_desc}
          </Text>

          {/* Long Description */}
          {ad.long_desc && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 12,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  lineHeight: 24,
                }}
              >
                {ad.long_desc}
              </Text>
            </View>
          )}

          {/* Additional Images */}
          {additionalImages.length > 0 && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 12,
                }}
              >
                Gallery
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  {additionalImages.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image.url || image }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                      }}
                      contentFit="cover"
                      transition={300}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Listing Stats */}
          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Eye size={14} color="#9CA3AF" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginLeft: 4,
                    }}
                  >
                    {ad.views || 0}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  Views
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Clock size={14} color="#9CA3AF" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginLeft: 4,
                    }}
                  >
                    {formatDate(ad.created_at).split(",")[0]}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  Posted
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            {ad.cta_quote && (
              <TouchableOpacity
                onPress={handleRequestQuote}
                style={{
                  backgroundColor: "#C6A15B",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <MessageSquare size={20} color="#111214" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111214",
                    marginLeft: 8,
                  }}
                >
                  Request Quote
                </Text>
              </TouchableOpacity>
            )}

            {ad.cta_whatsapp && ad.whatsapp_number && (
              <TouchableOpacity
                onPress={handleWhatsApp}
                style={{
                  backgroundColor: "#25D366",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <Phone size={20} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  Contact on WhatsApp
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
