import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Calendar, MapPin } from "lucide-react-native";
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

export default function AwardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch awards
  const { data: awards = [], refetch } = useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const response = await fetch("/api/awards");
      if (!response.ok) throw new Error("Failed to fetch awards");
      return response.json();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const handleAwardPress = (awardId) => {
    router.push(`/award/${awardId}`);
  };

  if (!fontsLoaded) {
    return null;
  }

  const upcomingAwards = awards.filter((award) => award.status === "upcoming");
  const otherAwards = awards.filter((award) => award.status !== "upcoming");

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
          Awards
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Celebrating Excellence in Design
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C6A15B"
            colors={["#C6A15B"]}
          />
        }
      >
        {upcomingAwards.length > 0 && (
          <>
            {/* Upcoming Awards Section */}
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginTop: 20,
                marginBottom: 16,
              }}
            >
              Upcoming Events
            </Text>

            {upcomingAwards.map((award) => (
              <TouchableOpacity
                key={award.id}
                onPress={() => handleAwardPress(award.id)}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: award.cover_image }}
                  style={{
                    width: "100%",
                    height: 180,
                  }}
                  contentFit="cover"
                  transition={300}
                />

                <View style={{ padding: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "PlayfairDisplay_700Bold",
                        color: "#F7F7F5",
                        flex: 1,
                        marginRight: 12,
                      }}
                      numberOfLines={2}
                    >
                      {award.name}
                    </Text>

                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: `${getStatusColor(award.status)}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_600SemiBold",
                          color: getStatusColor(award.status),
                          textTransform: "capitalize",
                        }}
                      >
                        {award.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                  >
                    {award.description}
                  </Text>

                  <View style={{ gap: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Calendar size={14} color="#C6A15B" />
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Inter_500Medium",
                          color: "#C6A15B",
                          marginLeft: 8,
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
                      <MapPin size={14} color="#6B7280" />
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                          marginLeft: 8,
                        }}
                      >
                        {award.country}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {otherAwards.length > 0 && (
          <>
            {/* Past Events Section */}
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginTop: upcomingAwards.length > 0 ? 30 : 20,
                marginBottom: 16,
              }}
            >
              Past Events
            </Text>

            {otherAwards.map((award) => (
              <TouchableOpacity
                key={award.id}
                onPress={() => handleAwardPress(award.id)}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: award.cover_image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={300}
                />

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "PlayfairDisplay_700Bold",
                        color: "#F7F7F5",
                        flex: 1,
                        marginRight: 8,
                      }}
                      numberOfLines={2}
                    >
                      {award.name}
                    </Text>

                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                        backgroundColor: `${getStatusColor(award.status)}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_500Medium",
                          color: getStatusColor(award.status),
                          textTransform: "capitalize",
                        }}
                      >
                        {award.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      lineHeight: 16,
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    {award.summary}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Calendar size={11} color="#6B7280" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_400Regular",
                        color: "#6B7280",
                        marginLeft: 4,
                        marginRight: 12,
                      }}
                    >
                      {formatDate(award.event_date)}
                    </Text>
                    <MapPin size={11} color="#6B7280" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_400Regular",
                        color: "#6B7280",
                        marginLeft: 4,
                      }}
                      numberOfLines={1}
                    >
                      {award.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {awards.length === 0 && (
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
              No Awards Events
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
              Check back soon for upcoming design and architecture awards
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}