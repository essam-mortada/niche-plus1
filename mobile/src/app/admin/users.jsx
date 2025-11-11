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
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Crown,
  UserCheck,
  User,
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

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch users
  const { data: usersData, refetch } = useQuery({
    queryKey: ["admin-users", currentPage, searchQuery, selectedRole],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedRole && { role: selectedRole }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.first_name} ${user.last_name} (${user.email})? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteUserMutation.mutate(user.id),
        },
      ],
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return Crown;
      case "supplier":
        return UserCheck;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#EF4444";
      case "supplier":
        return "#C6A15B";
      default:
        return "#6B7280";
    }
  };

  const getSubscriptionColor = (status) => {
    switch (status) {
      case "active":
        return "#22C55E";
      case "past_due":
        return "#F59E0B";
      case "canceled":
        return "#EF4444";
      default:
        return "#6B7280";
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

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "public", label: "Public" },
    { value: "supplier", label: "Supplier" },
    { value: "admin", label: "Admin" },
  ];

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};

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
              User Management
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/admin/users/create")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#C6A15B",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={20} color="#111214" />
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
          Manage platform users and permissions
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
            placeholder="Search by name or email..."
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

        {/* Role Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {roleOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedRole(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedRole === option.value ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: selectedRole === option.value ? "#111214" : "#F7F7F5",
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
            {pagination.total || 0}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Total Users
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
            {users.filter((u) => u.role === "supplier").length}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Suppliers
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
        {/* User List */}
        {users.map((user) => {
          const RoleIcon = getRoleIcon(user.role);
          const roleColor = getRoleColor(user.role);

          return (
            <View
              key={user.id}
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
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
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
                        marginRight: 8,
                      }}
                    >
                      {user.first_name} {user.last_name}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: `${roleColor}20`,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <RoleIcon size={12} color={roleColor} />
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_600SemiBold",
                          color: roleColor,
                          marginLeft: 4,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      marginBottom: 8,
                    }}
                  >
                    {user.email}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#6B7280",
                      }}
                    >
                      Joined {formatDate(user.created_at)}
                    </Text>

                    {user.role === "supplier" && user.subscription_status && (
                      <View
                        style={{
                          backgroundColor: `${getSubscriptionColor(user.subscription_status)}20`,
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: "Inter_600SemiBold",
                            color: getSubscriptionColor(
                              user.subscription_status,
                            ),
                            textTransform: "capitalize",
                          }}
                        >
                          {user.subscription_status}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/admin/users/${user.id}`)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#374151",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Edit size={14} color="#9CA3AF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteUser(user)}
                    disabled={deleteUserMutation.isPending}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#EF444420",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: deleteUserMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Supplier Stats */}
              {user.role === "supplier" && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#374151",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#F7F7F5",
                      }}
                    >
                      {user.total_ads || 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                      }}
                    >
                      Total Ads
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#22C55E",
                      }}
                    >
                      {user.approved_ads || 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                      }}
                    >
                      Approved
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#C6A15B",
                      }}
                    >
                      {user.credits_remaining || 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                      }}
                    >
                      Credits
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: currentPage === 1 ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: currentPage === 1 ? "#6B7280" : "#111214",
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
              }}
            >
              Page {currentPage} of {pagination.pages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={currentPage === pagination.pages}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  currentPage === pagination.pages ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    currentPage === pagination.pages ? "#6B7280" : "#111214",
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Users size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No users found
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
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
