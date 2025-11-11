import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Award,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Star,
  Calendar,
  User,
  Building,
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

export default function AdminNominationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch nominations
  const { data: nominationsData, refetch } = useQuery({
    queryKey: ["admin-nominations", currentPage, searchQuery, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(`/api/nominations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch nominations");
      return response.json();
    },
  });

  // Approve nomination mutation
  const approveNominationMutation = useMutation({
    mutationFn: async ({ nominationId, score }) => {
      const response = await fetch(`/api/nominations/${nominationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reviewer_id: 1, // Would be current admin user ID
          score,
        }),
      });
      if (!response.ok) throw new Error("Failed to approve nomination");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nominations"] });
    },
  });

  // Reject nomination mutation
  const rejectNominationMutation = useMutation({
    mutationFn: async ({ nominationId, reason }) => {
      const response = await fetch(`/api/nominations/${nominationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reviewer_id: 1, // Would be current admin user ID
          rejection_reason: reason,
        }),
      });
      if (!response.ok) throw new Error("Failed to reject nomination");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nominations"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApproveNomination = (nomination) => {
    Alert.prompt(
      "Approve Nomination",
      `Approve "${nomination.company_name}" for ${nomination.award_title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: (score) =>
            approveNominationMutation.mutate({
              nominationId: nomination.id,
              score: score ? parseInt(score) : null,
            }),
        },
      ],
      "plain-text",
      "",
      "numeric",
    );
  };

  const handleRejectNomination = (nomination) => {
    Alert.prompt(
      "Reject Nomination",
      `Please provide a reason for rejecting "${nomination.company_name}":`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: (reason) => {
            if (reason && reason.trim()) {
              rejectNominationMutation.mutate({
                nominationId: nomination.id,
                reason: reason.trim(),
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#22C55E";
      case "rejected":
        return "#EF4444";
      case "under_review":
        return "#F59E0B";
      case "pending":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "rejected":
        return XCircle;
      case "under_review":
      case "pending":
        return Clock;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const nominations = nominationsData?.nominations || [];
  const pagination = nominationsData?.pagination || {};

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
              Nomination Review
            </Text>
          </View>

          <Award size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Review and approve award nominations
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search nominations..."
            placeholderTextColor="#6B7280"
            style={{
              flex: 1,
              marginLeft: 12,
              paddingVertical: 12,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#F7F7F5",
            }}
          />
        </View>

        {/* Status Filter */}
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
                  selectedStatus === option.value ? "#C6A15B" : "#2A2D34",
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

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#F7F7F5",
            }}
          >
            {nominations.filter((n) => n.status === "pending").length}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Pending Review
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#F7F7F5",
            }}
          >
            {nominations.filter((n) => n.status === "approved").length}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Approved
          </Text>
        </View>
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
        {/* Nomination List */}
        {nominations.map((nomination) => {
          const StatusIcon = getStatusIcon(nomination.status);
          const statusColor = getStatusColor(nomination.status);

          return (
            <View
              key={nomination.id}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${statusColor}20`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <StatusIcon size={20} color={statusColor} />
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: "#F7F7F5",
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {nomination.company_name}
                    </Text>

                    <View
                      style={{
                        backgroundColor: `${statusColor}20`,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_600SemiBold",
                          color: statusColor,
                          textTransform: "capitalize",
                        }}
                      >
                        {nomination.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#C6A15B",
                      marginBottom: 4,
                    }}
                  >
                    {nomination.award_title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      marginBottom: 8,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {nomination.business_description}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <User size={12} color="#6B7280" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                          marginLeft: 4,
                          marginRight: 12,
                        }}
                      >
                        {nomination.user_first_name} {nomination.user_last_name}
                      </Text>

                      <Calendar size={12} color="#6B7280" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                          marginLeft: 4,
                        }}
                      >
                        {formatDate(nomination.created_at)}
                      </Text>
                    </View>

                    {nomination.nomination_type && (
                      <View
                        style={{
                          backgroundColor: "#8B5CF620",
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Inter_600SemiBold",
                            color: "#8B5CF6",
                            textTransform: "capitalize",
                          }}
                        >
                          {nomination.nomination_type}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#374151",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/admin/nominations/${nomination.id}`)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: "#374151",
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Eye size={14} color="#9CA3AF" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_600SemiBold",
                      color: "#9CA3AF",
                      marginLeft: 4,
                    }}
                  >
                    View Details
                  </Text>
                </TouchableOpacity>

                {nomination.status === "pending" && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleApproveNomination(nomination)}
                      disabled={approveNominationMutation.isPending}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#22C55E20",
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: approveNominationMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <CheckCircle size={14} color="#22C55E" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_600SemiBold",
                          color: "#22C55E",
                          marginLeft: 4,
                        }}
                      >
                        Approve
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleRejectNomination(nomination)}
                      disabled={rejectNominationMutation.isPending}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#EF444420",
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: rejectNominationMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <XCircle size={14} color="#EF4444" />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter_600SemiBold",
                          color: "#EF4444",
                          marginLeft: 4,
                        }}
                      >
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {nomination.status === "approved" && nomination.score && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F59E0B20",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Star size={12} color="#F59E0B" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_600SemiBold",
                        color: "#F59E0B",
                        marginLeft: 4,
                      }}
                    >
                      Score: {nomination.score}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {nominations.length === 0 && (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Award size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No nominations found
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
              Award nominations will appear here for review
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
