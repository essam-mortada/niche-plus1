import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Share2,
  Calendar,
  MapPin,
  Users,
  Award,
  ExternalLink,
  Clock,
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

export default function AwardDetailScreen() {
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

  // Fetch award details
  const { data: award, isLoading } = useQuery({
    queryKey: ["award", id],
    queryFn: async () => {
      const response = await fetch(`/api/awards/${id}`);
      if (!response.ok) throw new Error("Failed to fetch award");
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch award categories
  const { data: categories = [] } = useQuery({
    queryKey: ["award-categories", id],
    queryFn: async () => {
      const response = await fetch(`/api/categories?award_id=${id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this award: ${award?.name}\n\n${award?.summary}`,
        title: award?.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleNominate = () => {
    router.push(`/nominate/${id}`);
  };

  const handleBuyTickets = () => {
    router.push(`/tickets/${id}`);
  };

  const openRecapLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open this link");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open this link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "#C6A15B";
      case "ongoing":
        return "#22C55E";
      case "completed":
        return "#6B7280";
      default:
        return "#C6A15B";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming Event";
      case "ongoing":
        return "Event in Progress";
      case "completed":
        return "Event Completed";
      default:
        return "Event";
    }
  };

  const isEventPast = () => {
    if (!award?.event_date) return false;
    return new Date(award.event_date) < new Date();
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
          Loading award details...
        </Text>
      </View>
    );
  }

  if (!award) {
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
          Award Not Found
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          The award you're looking for doesn't exist or has been removed.
        </Text>
      </View>
    );
  }

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
        {/* Hero Image */}
        {award.cover_image && (
          <Image
            source={{ uri: award.cover_image }}
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
          {/* Status Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: `${getStatusColor(award.status)}20`,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                color: getStatusColor(award.status),
              }}
            >
              {getStatusText(award.status)}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              lineHeight: 36,
              marginBottom: 20,
            }}
          >
            {award.name}
          </Text>

          {/* Event Details */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Calendar size={18} color="#C6A15B" />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginLeft: 12,
                }}
              >
                {formatDate(award.event_date)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MapPin size={18} color="#C6A15B" />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                {award.venue
                  ? `${award.venue}, ${award.city}, ${award.country}`
                  : `${award.city}, ${award.country}`}
              </Text>
            </View>

            {award.venue && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Clock size={18} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    marginLeft: 12,
                  }}
                >
                  Venue: {award.venue}
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          {award.summary && (
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_400Regular",
                color: "#C6A15B",
                lineHeight: 26,
                marginBottom: 24,
                fontStyle: "italic",
              }}
            >
              {award.summary}
            </Text>
          )}

          {/* Description */}
          {award.long_description && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  lineHeight: 26,
                }}
              >
                {award.long_description}
              </Text>
            </View>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 16,
                }}
              >
                Award Categories
              </Text>

              <View style={{ gap: 12 }}>
                {categories.map((category) => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: "#2A2D34",
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Award size={20} color="#C6A15B" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#F7F7F5",
                          marginBottom: 4,
                        }}
                      >
                        {category.name}
                      </Text>
                      {category.description && (
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_400Regular",
                            color: "#9CA3AF",
                            lineHeight: 18,
                          }}
                        >
                          {category.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recap Links */}
          {award.recap_links && award.recap_links.length > 0 && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: "#F7F7F5",
                  marginBottom: 16,
                }}
              >
                Event Highlights
              </Text>

              <View style={{ gap: 12 }}>
                {award.recap_links.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openRecapLink(link.url)}
                    style={{
                      backgroundColor: "#2A2D34",
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#F7F7F5",
                          marginBottom: 4,
                        }}
                      >
                        {link.title}
                      </Text>
                      {link.description && (
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_400Regular",
                            color: "#9CA3AF",
                          }}
                        >
                          {link.description}
                        </Text>
                      )}
                    </View>
                    <ExternalLink size={20} color="#C6A15B" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            {!isEventPast() && (
              <TouchableOpacity
                onPress={handleNominate}
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
                <Award size={20} color="#111214" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111214",
                    marginLeft: 8,
                  }}
                >
                  Submit Nomination
                </Text>
              </TouchableOpacity>
            )}

            {!isEventPast() && (
              <TouchableOpacity
                onPress={handleBuyTickets}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#C6A15B",
                }}
                activeOpacity={0.8}
              >
                <Users size={20} color="#C6A15B" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#C6A15B",
                    marginLeft: 8,
                  }}
                >
                  Get Tickets
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
