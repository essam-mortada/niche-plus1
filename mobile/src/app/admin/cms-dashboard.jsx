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
  Users,
  FileText,
  Grid3X3,
  Award,
  MessageSquare,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MousePointer,
  Star,
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

const { width } = Dimensions.get("window");

export default function CMSDashboardScreen() {
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

  // Fetch comprehensive dashboard data
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ["cms-dashboard", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(
        `/api/cms/dashboard?period=${selectedPeriod}`,
      );
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  const kpis = dashboardData?.kpis || {};
  const topAds = dashboardData?.topPerformingAds || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const categoryStats = dashboardData?.categoryDistribution || [];
  const dailyStats = dashboardData?.dailyStats || [];

  const formatCurrency = (cents) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <View
      style={{
        backgroundColor: "#2A2D34",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: width * 0.35,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${color}20`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 8,
          }}
        >
          <Icon size={16} color={color} />
        </View>
        {trend && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TrendingUp size={12} color="#22C55E" />
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Inter_500Medium",
                color: "#22C55E",
                marginLeft: 2,
              }}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          fontSize: 20,
          fontFamily: "Inter_600SemiBold",
          color: "#F7F7F5",
          marginBottom: 2,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: "#9CA3AF",
          marginBottom: 2,
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );

  const ActivityItem = ({ type, title, userName, createdAt }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case "ad_pending":
          return { icon: Clock, color: "#F59E0B" };
        case "request_new":
          return { icon: MessageSquare, color: "#EF4444" };
        case "subscription_past_due":
          return { icon: AlertCircle, color: "#EF4444" };
        default:
          return { icon: AlertCircle, color: "#6B7280" };
      }
    };

    const { icon: Icon, color } = getActivityIcon(type);

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#374151",
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${color}20`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Icon size={14} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#F7F7F5",
              marginBottom: 2,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            {userName} • {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: "#C6A15B20",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Inter_500Medium",
              color: "#C6A15B",
            }}
          >
            View
          </Text>
        </TouchableOpacity>
      </View>
    );
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
              CMS Dashboard
            </Text>
          </View>

          <BarChart3 size={24} color="#C6A15B" />
        </View>

        {/* Period Selector */}
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          {["7", "30", "90"].map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedPeriod === period ? "#C6A15B" : "#2A2D34",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: selectedPeriod === period ? "#111214" : "#9CA3AF",
                }}
              >
                {period} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
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
        {/* Revenue Overview */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Revenue Overview
          </Text>

          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#22C55E",
                  }}
                >
                  {formatCurrency(kpis.revenue?.totalRevenueCents || 0)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  Total Revenue
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#C6A15B",
                  }}
                >
                  {formatCurrency(kpis.revenue?.periodRevenueCents || 0)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  This Period
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#8B5CF6",
                  }}
                >
                  {kpis.revenue?.successfulPayments || 0}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  Payments
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={{ paddingLeft: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Key Metrics
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <KPICard
              title="Total Users"
              value={kpis.users?.total || 0}
              subtitle={`+${kpis.users?.newInPeriod || 0} this period`}
              icon={Users}
              color="#3B82F6"
              trend="+12%"
            />

            <KPICard
              title="Live Ads"
              value={kpis.marketplace?.liveAds || 0}
              subtitle={`${kpis.marketplace?.pendingAds || 0} pending review`}
              icon={CheckCircle}
              color="#22C55E"
            />

            <KPICard
              title="Subscriptions"
              value={kpis.subscriptions?.active || 0}
              subtitle={`${kpis.subscriptions?.pastDue || 0} past due`}
              icon={DollarSign}
              color="#C6A15B"
            />

            <KPICard
              title="Awards"
              value={kpis.awards?.totalAwards || 0}
              subtitle={`${kpis.awards?.totalNominations || 0} nominations`}
              icon={Award}
              color="#F59E0B"
            />

            <KPICard
              title="Articles"
              value={kpis.magazine?.publishedArticles || 0}
              subtitle={`${kpis.magazine?.totalIssues || 0} issues`}
              icon={FileText}
              color="#10B981"
            />
          </ScrollView>
        </View>

        {/* Top Performing Ads */}
        {topAds.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Top Performing Ads
            </Text>

            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {topAds.map((ad, index) => (
                <View
                  key={ad.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: index < topAds.length - 1 ? 1 : 0,
                    borderBottomColor: "#374151",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: "#F7F7F5",
                        marginBottom: 2,
                      }}
                    >
                      {ad.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                      }}
                    >
                      {ad.company_name}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ alignItems: "center", marginRight: 16 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_600SemiBold",
                          color: "#C6A15B",
                        }}
                      >
                        {ad.views || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                        }}
                      >
                        Views
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
                        {ad.clicks || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                        }}
                      >
                        Clicks
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Recent Activity
            </Text>

            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {recentActivity.slice(0, 5).map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  userName={activity.user_name}
                  createdAt={activity.created_at}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                title: "Review Ads",
                icon: Grid3X3,
                route: "/admin/marketplace-moderation",
                color: "#F59E0B",
                count: kpis.marketplace?.pendingAds,
              },
              {
                title: "Manage Users",
                icon: Users,
                route: "/admin/users",
                color: "#3B82F6",
                count: kpis.users?.total,
              },
              {
                title: "Content",
                icon: FileText,
                route: "/admin/articles",
                color: "#10B981",
                count: kpis.magazine?.totalArticles,
              },
              {
                title: "Awards",
                icon: Award,
                route: "/admin/awards",
                color: "#C6A15B",
                count: kpis.awards?.totalAwards,
              },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(action.route)}
                style={{
                  width: "48%",
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${action.color}20`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <action.icon size={20} color={action.color} />
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F7F7F5",
                    textAlign: "center",
                    marginBottom: 2,
                  }}
                >
                  {action.title}
                </Text>

                {action.count !== undefined && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                    }}
                  >
                    {action.count}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
