import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  Award,
  Filter,
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
import { apiGet } from "@/utils/api";

const { width } = Dimensions.get("window");

export default function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch analytics data
  const { data: analytics, refetch } = useQuery({
    queryKey: ["admin-analytics", selectedPeriod],
    queryFn: () => apiGet(`/api/admin/analytics?period=${selectedPeriod}`),
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
    }).format((amount || 0) / 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (!fontsLoaded) {
    return null;
  }

  const periodOptions = [
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
    { value: "365", label: "1 Year" },
  ];

  const keyMetrics = [
    {
      icon: Users,
      title: "Total Users",
      value: analytics?.summary?.totalUsers || 0,
      change: getPercentageChange(analytics?.summary?.newUsers || 0, 50), // Mock previous period
      color: "#3B82F6",
      subtitle: `+${analytics?.summary?.newUsers || 0} this period`,
    },
    {
      icon: DollarSign,
      title: "Revenue",
      value: formatCurrency(
        analytics?.revenueData?.reduce(
          (sum, item) => sum + (item.revenue || 0),
          0,
        ) || 0,
      ),
      change: 15.2, // Mock calculation
      color: "#22C55E",
      subtitle: `${analytics?.revenueData?.reduce((sum, item) => sum + (item.transactions || 0), 0) || 0} transactions`,
    },
    {
      icon: FileText,
      title: "Pending Reviews",
      value: analytics?.summary?.pendingReviews || 0,
      change: -8.3, // Mock calculation
      color: "#F59E0B",
      subtitle: `Avg ${analytics?.summary?.avgReviewTime?.toFixed(1) || 0}h review time`,
    },
    {
      icon: Award,
      title: "Active Suppliers",
      value: analytics?.summary?.activeSuppliers || 0,
      change: 12.5, // Mock calculation
      color: "#8B5CF6",
      subtitle: "Subscription based",
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
              Analytics Dashboard
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
          Platform performance insights and metrics
        </Text>
      </View>

      {/* Period Filter */}
      <View style={{ paddingLeft: 20, paddingVertical: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedPeriod(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedPeriod === option.value ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedPeriod === option.value ? "#111214" : "#F7F7F5",
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
        {/* Key Metrics */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          {keyMetrics.map((metric, index) => (
            <View
              key={index}
              style={{
                width: "48%",
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: `${metric.color}20`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <metric.icon size={16} color={metric.color} />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {metric.change > 0 ? (
                    <TrendingUp size={14} color="#22C55E" />
                  ) : (
                    <TrendingDown size={14} color="#EF4444" />
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                      color: metric.change > 0 ? "#22C55E" : "#EF4444",
                      marginLeft: 4,
                    }}
                  >
                    {Math.abs(metric.change).toFixed(1)}%
                  </Text>
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
                {metric.value}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: metric.color,
                  marginBottom: 2,
                }}
              >
                {metric.title}
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                }}
              >
                {metric.subtitle}
              </Text>
            </View>
          ))}
        </View>

        {/* User Growth Chart */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          User Growth
        </Text>

        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
            marginBottom: 30,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Daily Registrations
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
              }}
            >
              Last {selectedPeriod} days
            </Text>
          </View>

          {/* Simple chart representation */}
          <View style={{ height: 120 }}>
            {analytics?.userGrowth?.slice(-7).map((day, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    width: 60,
                  }}
                >
                  {formatDate(day.date)}
                </Text>

                <View
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: "#374151",
                    borderRadius: 4,
                    marginHorizontal: 8,
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min((day.new_users / 10) * 100, 100)}%`,
                      height: "100%",
                      backgroundColor: "#3B82F6",
                      borderRadius: 4,
                    }}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F7F7F5",
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {day.new_users || 0}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ad Performance */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          Ad Performance by Category
        </Text>

        {analytics?.adPerformance?.slice(0, 5).map((category, index) => (
          <View
            key={index}
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
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                }}
              >
                {category.category || "Uncategorized"}
              </Text>

              <View
                style={{
                  backgroundColor: "#22C55E20",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: "#22C55E",
                  }}
                >
                  {category.approval_rate || 0}% approved
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                Total: {category.total_ads || 0}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                Approved: {category.approved_ads || 0}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                Rejected: {category.rejected_ads || 0}
              </Text>
            </View>
          </View>
        ))}

        {/* Top Suppliers */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginTop: 30,
            marginBottom: 16,
          }}
        >
          Top Performing Suppliers
        </Text>

        {analytics?.topSuppliers?.slice(0, 5).map((supplier, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#C6A15B20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#C6A15B",
                }}
              >
                {index + 1}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 2,
                }}
              >
                {supplier.first_name} {supplier.last_name}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                {supplier.approved_ads || 0} approved ads •{" "}
                {formatCurrency(supplier.revenue_generated || 0)} revenue
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor:
                  supplier.subscription_status === "active"
                    ? "#22C55E20"
                    : "#6B728020",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    supplier.subscription_status === "active"
                      ? "#22C55E"
                      : "#6B7280",
                  textTransform: "capitalize",
                }}
              >
                {supplier.subscription_status || "inactive"}
              </Text>
            </View>
          </View>
        ))}

        {/* Geographic Distribution */}
        {analytics?.geographicData?.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginTop: 30,
                marginBottom: 16,
              }}
            >
              Geographic Distribution
            </Text>

            {analytics.geographicData.slice(0, 5).map((location, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MapPin size={20} color="#8B5CF6" style={{ marginRight: 12 }} />

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginBottom: 2,
                    }}
                  >
                    {location.location}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                    }}
                  >
                    {location.ad_count} ads • {location.approved_count} approved
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#8B5CF6",
                  }}
                >
                  {Math.round(
                    (location.approved_count / location.ad_count) * 100,
                  )}
                  %
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
