import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
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

export default function AdminReviewQueue() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch pending ads
  const { data: ads = [], refetch } = useQuery({
    queryKey: ["admin-ads", selectedStatus],
    queryFn: async () => {
      const response = await fetch(`/api/ads?status=${selectedStatus}`);
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
  });

  // Approve ad mutation
  const approveMutation = useMutation({
    mutationFn: async (adId) => {
      const response = await fetch(`/api/ads/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Failed to approve ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  // Reject ad mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ adId, reason }) => {
      const response = await fetch(`/api/ads/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejection_reason: reason }),
      });
      if (!response.ok) throw new Error("Failed to reject ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = (ad) => {
    Alert.alert(
      "Approve Ad",
      `Approve "${ad.title}"? This will make it live for 30 days and deduct 1 credit from the supplier.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => approveMutation.mutate(ad.id),
        },
      ],
    );
  };

  const handleReject = (ad) => {
    Alert.prompt(
      "Reject Ad",
      `Please provide a reason for rejecting "${ad.title}":`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: (reason) => {
            if (reason && reason.trim()) {
              rejectMutation.mutate({ adId: ad.id, reason: reason.trim() });
            } else {
              Alert.alert("Error", "Please provide a reason for rejection.");
            }
          },
        },
      ],
      "plain-text",
      "",
      "Please provide a detailed reason for rejection...",
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#22C55E";
      case "pending":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#F59E0B" },
    { value: "approved", label: "Approved", color: "#22C55E" },
    { value: "rejected", label: "Rejected", color: "#EF4444" },
    { value: "expired", label: "Expired", color: "#6B7280" },
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
              Review Queue
            </Text>
          </View>

          <Filter size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Review and manage ad submissions
        </Text>
      </View>

      {/* Status Filter */}
      <View style={{ paddingLeft: 20, paddingVertical: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedStatus(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedStatus === option.value ? option.color : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedStatus === option.value ? "#111214" : "#F7F7F5",
                }}
              >
                {option.label}
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
        {ads.length > 0 ? (
          ads.map((ad) => (
            <View
              key={ad.id}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              {ad.images && ad.images.length > 0 && (
                <Image
                  source={{ uri: ad.images[0] }}
                  style={{
                    width: "100%",
                    height: 160,
                  }}
                  contentFit="cover"
                  transition={300}
                />
              )}

              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "PlayfairDisplay_700Bold",
                        color: "#F7F7F5",
                        marginBottom: 6,
                        lineHeight: 22,
                      }}
                    >
                      {ad.title}
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      {ad.category_name} • {formatDate(ad.created_at)}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: `${getStatusColor(ad.status)}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_600SemiBold",
                        color: getStatusColor(ad.status),
                        textTransform: "capitalize",
                      }}
                    >
                      {ad.status}
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
                  numberOfLines={3}
                >
                  {ad.short_description}
                </Text>

                {ad.price_label && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#C6A15B",
                      marginBottom: 12,
                    }}
                  >
                    {ad.price_label}
                  </Text>
                )}

                {ad.rejection_reason && (
                  <View
                    style={{
                      backgroundColor: "#EF444420",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                        color: "#EF4444",
                        marginBottom: 4,
                      }}
                    >
                      Rejection Reason:
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#EF4444",
                        lineHeight: 16,
                      }}
                    >
                      {ad.rejection_reason}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/admin/review/${ad.id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: "#111214",
                      borderRadius: 8,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Eye size={16} color="#C6A15B" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#C6A15B",
                        marginLeft: 6,
                      }}
                    >
                      Review
                    </Text>
                  </TouchableOpacity>

                  {ad.status === "pending" && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleApprove(ad)}
                        disabled={approveMutation.isPending}
                        style={{
                          flex: 1,
                          backgroundColor: "#22C55E",
                          borderRadius: 8,
                          paddingVertical: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: approveMutation.isPending ? 0.6 : 1,
                        }}
                      >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_600SemiBold",
                            color: "#FFFFFF",
                            marginLeft: 6,
                          }}
                        >
                          Approve
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReject(ad)}
                        disabled={rejectMutation.isPending}
                        style={{
                          flex: 1,
                          backgroundColor: "#EF4444",
                          borderRadius: 8,
                          paddingVertical: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: rejectMutation.isPending ? 0.6 : 1,
                        }}
                      >
                        <XCircle size={16} color="#FFFFFF" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_600SemiBold",
                            color: "#FFFFFF",
                            marginLeft: 6,
                          }}
                        >
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))
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
            <Clock size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No {selectedStatus} ads
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
              There are currently no ads with {selectedStatus} status
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
