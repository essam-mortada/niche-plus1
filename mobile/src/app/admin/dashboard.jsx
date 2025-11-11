import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch admin stats
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch admin stats");
      return response.json();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100); // Convert from cents
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

  if (!fontsLoaded) {
    return null;
  }

  const stats = dashboardData?.stats || {};
  const recentAds = dashboardData?.recentAds || [];
  const recentRequests = dashboardData?.recentRequests || [];

  const statCards = [
    {
      icon: Users,
      title: "Active Suppliers",
      value: stats.active_suppliers || 0,
      subtitle: `${stats.total_suppliers || 0} total`,
      color: "#22C55E",
      action: () => router.push("/admin/suppliers"),
    },
    {
      icon: FileText,
      title: "Pending Reviews",
      value: stats.pending_ads || 0,
      subtitle: `${stats.total_ads || 0} total ads`,
      color: "#F59E0B",
      action: () => router.push("/admin/review-queue"),
    },
    {
      icon: DollarSign,
      title: "Revenue",
      value: formatCurrency(stats.total_revenue || 0),
      subtitle: `${stats.successful_transactions || 0} transactions`,
      color: "#C6A15B",
      action: () => router.push("/admin/payments"),
    },
    {
      icon: AlertTriangle,
      title: "Service Requests",
      value: stats.pending_requests || 0,
      subtitle: `${stats.total_requests || 0} total`,
      color: "#3B82F6",
      action: () => router.push("/admin/requests"),
    },
  ];

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

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
              Admin Dashboard
            </Text>
          </View>

          <TrendingUp size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Monitor and manage the Niche+ platform
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
        {/* Stats Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 30,
          }}
        >
          {statCards.map((stat, index) => (
            <TouchableOpacity
              key={index}
              onPress={stat.action}
              style={{
                width: "48%",
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
              activeOpacity={0.8}
            >
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
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: `${stat.color}20`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <stat.icon size={18} color={stat.color} />
                </View>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: stat.color,
                  marginBottom: 2,
                }}
              >
                {stat.title}
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                }}
              >
                {stat.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          Recent Ad Submissions
        </Text>

        {recentAds.length > 0 ? (
          recentAds.slice(0, 5).map((ad) => {
            const StatusIcon = getStatusIcon(ad.status);
            return (
              <TouchableOpacity
                key={ad.id}
                onPress={() => router.push(`/admin/review/${ad.id}`)}
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${getStatusColor(ad.status)}20`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <StatusIcon size={18} color={getStatusColor(ad.status)} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {ad.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                      marginBottom: 2,
                    }}
                  >
                    by {ad.first_name} {ad.last_name} • {ad.category_name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                    }}
                  >
                    {formatDate(ad.created_at)}
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
                      fontSize: 10,
                      fontFamily: "Inter_600SemiBold",
                      color: getStatusColor(ad.status),
                      textTransform: "capitalize",
                    }}
                  >
                    {ad.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                textAlign: "center",
              }}
            >
              No recent ad submissions
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginTop: 30,
            marginBottom: 16,
          }}
        >
          Quick Actions
        </Text>

        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/admin/cms")}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Content Management System
            </Text>
            <View
              style={{
                backgroundColor: "#8B5CF620",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#8B5CF6",
                }}
              >
                CMS
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/admin/awards")}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Manage Awards
            </Text>
            <View
              style={{
                backgroundColor: "#C6A15B20",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#C6A15B",
                }}
              >
                Awards
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/admin/review-queue")}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Review Pending Ads
            </Text>
            <View
              style={{
                backgroundColor: "#F59E0B20",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F59E0B",
                }}
              >
                {stats.pending_ads || 0}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/admin/analytics")}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Analytics Dashboard
            </Text>
            <View
              style={{
                backgroundColor: "#C6A15B20",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#C6A15B",
                }}
              >
                Stats
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/admin/users")}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Manage Users
            </Text>
            <View
              style={{
                backgroundColor: "#3B82F620",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#3B82F6",
                }}
              >
                Users
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
