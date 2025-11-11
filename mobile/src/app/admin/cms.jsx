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
  Grid3X3,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2,
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

export default function AdminCMSScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch CMS overview data
  const { data: cmsData, refetch } = useQuery({
    queryKey: ["cms-overview"],
    queryFn: async () => {
      const [analytics, users, categories, articlesResponse, awards] =
        await Promise.all([
          fetch("/api/admin/analytics?period=7").then((r) => r.json()),
          fetch("/api/admin/users?limit=5").then((r) => r.json()),
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/articles?limit=5").then((r) => r.json()),
          fetch("/api/awards?limit=5").then((r) => r.json()),
        ]);

      // Handle different response formats
      const articles = articlesResponse?.articles || articlesResponse || [];

      return { analytics, users, categories, articles, awards };
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

  const cmsModules = [
    {
      icon: Users,
      title: "User Management",
      subtitle: `${cmsData?.users?.pagination?.total || 0} total users`,
      color: "#3B82F6",
      route: "/admin/users",
      stats: {
        total: cmsData?.users?.pagination?.total || 0,
        new: cmsData?.analytics?.summary?.newUsers || 0,
      },
    },
    {
      icon: Grid3X3,
      title: "Categories",
      subtitle: `${cmsData?.categories?.length || 0} categories`,
      color: "#8B5CF6",
      route: "/admin/categories",
      stats: {
        total: cmsData?.categories?.length || 0,
        active: cmsData?.categories?.filter((c) => c.id)?.length || 0,
      },
    },
    {
      icon: FileText,
      title: "Articles",
      subtitle: `${cmsData?.articles?.length || 0} articles`,
      color: "#10B981",
      route: "/admin/articles",
      stats: {
        total: cmsData?.articles?.length || 0,
        published:
          cmsData?.articles?.filter((a) => a.published_at)?.length || 0,
      },
    },
    {
      icon: Award,
      title: "Awards",
      subtitle: `${cmsData?.awards?.length || 0} awards`,
      color: "#F59E0B",
      route: "/admin/awards",
      stats: {
        total: cmsData?.awards?.length || 0,
        upcoming:
          cmsData?.awards?.filter((a) => a.status === "upcoming")?.length || 0,
      },
    },
    {
      icon: MessageSquare,
      title: "Service Requests",
      subtitle: `${cmsData?.analytics?.summary?.pendingRequests || 0} pending`,
      color: "#EF4444",
      route: "/admin/requests",
      stats: {
        pending: cmsData?.analytics?.summary?.pendingRequests || 0,
        total: 0, // Would come from requests API
      },
    },
    {
      icon: BarChart3,
      title: "Analytics",
      subtitle: "Platform insights",
      color: "#C6A15B",
      route: "/admin/analytics",
      stats: {
        users: cmsData?.analytics?.summary?.totalUsers || 0,
        revenue: 0, // Would calculate from analytics
      },
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      title: "Add User",
      color: "#3B82F6",
      action: () => router.push("/admin/users/create"),
    },
    {
      icon: Plus,
      title: "Add Category",
      color: "#8B5CF6",
      action: () => router.push("/admin/categories/create"),
    },
    {
      icon: Plus,
      title: "Add Article",
      color: "#10B981",
      action: () => router.push("/admin/articles/create"),
    },
    {
      icon: Plus,
      title: "Add Award",
      color: "#F59E0B",
      action: () => router.push("/admin/awards/create"),
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
              Content Management
            </Text>
          </View>

          <Settings size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Manage all aspects of the Niche+ platform
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
        {/* Quick Stats */}
        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
            marginTop: 20,
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Platform Overview
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: "#C6A15B",
                }}
              >
                {cmsData?.analytics?.summary?.totalUsers || 0}
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

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                }}
              >
                {cmsData?.analytics?.summary?.activeSuppliers || 0}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                Active Suppliers
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F59E0B",
                }}
              >
                {cmsData?.analytics?.summary?.pendingReviews || 0}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                Pending Reviews
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text
          style={{
            fontSize: 20,
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
            marginBottom: 30,
          }}
        >
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.action}
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
                  marginBottom: 12,
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
                }}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CMS Modules */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginBottom: 16,
          }}
        >
          Content Modules
        </Text>

        {cmsModules.map((module, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(module.route)}
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
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${module.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <module.icon size={24} color={module.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                  marginBottom: 2,
                }}
              >
                {module.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                }}
              >
                {module.subtitle}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: `${module.color}20`,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: module.color,
                  }}
                >
                  {Object.values(module.stats)[0]}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                }}
              >
                {Object.keys(module.stats)[0]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* System Health */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "PlayfairDisplay_700Bold",
            color: "#F7F7F5",
            marginTop: 30,
            marginBottom: 16,
          }}
        >
          System Health
        </Text>

        <View
          style={{
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Average Review Time
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#22C55E",
              }}
            >
              {Math.round(cmsData?.analytics?.summary?.avgReviewTime || 0)}h
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Content Categories
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#8B5CF6",
              }}
            >
              {cmsData?.categories?.length || 0}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Published Articles
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#10B981",
              }}
            >
              {cmsData?.articles?.filter((a) => a.published_at)?.length || 0}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
