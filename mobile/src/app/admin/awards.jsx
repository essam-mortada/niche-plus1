import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Trophy,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiCall } from "@/utils/api";

export default function AdminAwardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch awards
  const {
    data: awardsData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["cms-awards", selectedStatus],
    queryFn: async () => {
      let url = "/api/cms/awards";
      if (selectedStatus !== "all") {
        url += `?status=${selectedStatus}`;
      }
      const response = await apiCall(url);
      if (!response.ok) throw new Error("Failed to fetch awards");
      return response.json();
    },
  });

  // Delete award mutation
  const deleteAwardMutation = useMutation({
    mutationFn: async (awardId) => {
      const response = await apiCall(`/api/cms/awards/${awardId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete award");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cms-awards"]);
      Alert.alert("Success", "Award deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete award");
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateAward = () => {
    router.push("/admin/awards/create");
  };

  const handleEditAward = (awardId) => {
    router.push(`/admin/awards/edit/${awardId}`);
  };

  const handleViewAward = (awardId) => {
    router.push(`/award/${awardId}`);
  };

  const handleDeleteAward = (award) => {
    Alert.alert(
      "Delete Award",
      `Are you sure you want to delete "${award.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAwardMutation.mutate(award.id),
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "#22C55E";
      case "draft":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const awards = awardsData?.awards || [];
  const statusOptions = ["all", "draft", "published"];

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
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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

            <Text
              style={{
                fontSize: 24,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
              }}
            >
              Awards Management
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateAward}
            style={{
              backgroundColor: "#C6A15B",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={18} color="#111214" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
                marginLeft: 6,
              }}
            >
              New Award
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Create and manage award events
        </Text>
      </View>

      {/* Status Filter */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedStatus === status ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: selectedStatus === status ? "#111214" : "#F7F7F5",
                  textTransform: "capitalize",
                }}
              >
                {status === "all" ? "All Awards" : status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {isLoading ? (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
              }}
            >
              Loading awards...
            </Text>
          </View>
        ) : awards.length > 0 ? (
          <View style={{ gap: 16 }}>
            {awards.map((award) => (
              <View
                key={award.id}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Award Image */}
                {award.cover_image && (
                  <TouchableOpacity onPress={() => handleViewAward(award.id)}>
                    <Image
                      source={{ uri: award.cover_image }}
                      style={{
                        width: "100%",
                        height: 180,
                      }}
                      contentFit="cover"
                      transition={300}
                    />
                  </TouchableOpacity>
                )}

                {/* Award Content */}
                <View style={{ padding: 16 }}>
                  {/* Status & Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: `${getStatusColor(award.status)}20`,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
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

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleViewAward(award.id)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#3B3B3B",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Eye size={16} color="#F7F7F5" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleEditAward(award.id)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#C6A15B20",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Edit size={16} color="#C6A15B" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteAward(award)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#EF444420",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Award Title */}
                  <TouchableOpacity onPress={() => handleViewAward(award.id)}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "PlayfairDisplay_700Bold",
                        color: "#F7F7F5",
                        marginBottom: 8,
                        lineHeight: 26,
                      }}
                      numberOfLines={2}
                    >
                      {award.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Award Details */}
                  <View style={{ gap: 8, marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Calendar size={14} color="#9CA3AF" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_500Medium",
                          color: "#F7F7F5",
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
                      <MapPin size={14} color="#9CA3AF" />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                          marginLeft: 8,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {award.city}, {award.country}
                      </Text>
                    </View>

                    {award.venue && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Trophy size={14} color="#9CA3AF" />
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_400Regular",
                            color: "#9CA3AF",
                            marginLeft: 8,
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {award.venue}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Award Summary */}
                  {award.summary && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: "#C6A15B",
                        lineHeight: 20,
                        marginBottom: 12,
                        fontStyle: "italic",
                      }}
                      numberOfLines={2}
                    >
                      {award.summary}
                    </Text>
                  )}

                  {/* Stats */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "#1F1F1F",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#F7F7F5",
                        }}
                      >
                        {award.category_count || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                        }}
                      >
                        Categories
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#F7F7F5",
                        }}
                      >
                        {award.nomination_count || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                        }}
                      >
                        Nominations
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#F7F7F5",
                        }}
                      >
                        {award.ticket_count || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                        }}
                      >
                        Tickets
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Trophy size={48} color="#6B7280" />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginTop: 16,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No Awards Found
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              {selectedStatus === "all"
                ? "Create your first award event to get started"
                : `No ${selectedStatus} awards found`}
            </Text>
            <TouchableOpacity
              onPress={handleCreateAward}
              style={{
                backgroundColor: "#C6A15B",
                borderRadius: 12,
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Plus size={18} color="#111214" />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111214",
                  marginLeft: 8,
                }}
              >
                Create Award
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
