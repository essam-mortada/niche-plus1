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
  CreditCard,
  Plus,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
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

export default function SupplierDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Mock user ID - in real app this would come from auth context
  const mockUserId = 1;

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch supplier data
  const { data: supplier, refetch: refetchSupplier } = useQuery({
    queryKey: ["supplier", mockUserId],
    queryFn: () => apiGet(`/api/suppliers?user_id=${mockUserId}`),
  });

  // Fetch supplier's ads
  const { data: supplierAds = [], refetch: refetchAds } = useQuery({
    queryKey: ["supplier-ads", supplier?.id],
    queryFn: () => {
      if (!supplier?.id) return [];
      return apiGet(`/api/ads?supplier_id=${supplier.id}`);
    },
    enabled: !!supplier?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSupplier(), refetchAds()]);
    setRefreshing(false);
  };

  const getSubscriptionStatusColor = (status) => {
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

  const getSubscriptionStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      default:
        return "Inactive";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  // Group ads by status
  const adsByStatus = {
    draft: supplierAds.filter((ad) => ad.status === "draft"),
    pending: supplierAds.filter((ad) => ad.status === "pending"),
    approved: supplierAds.filter((ad) => ad.status === "approved"),
    rejected: supplierAds.filter((ad) => ad.status === "rejected"),
    expired: supplierAds.filter((ad) => ad.status === "expired"),
  };

  const canCreateAds =
    supplier &&
    supplier.subscription_status === "active" &&
    supplier.credits_remaining > 0;

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
              Supplier Dashboard
            </Text>
          </View>

          <Package size={24} color="#C6A15B" />
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Manage your Publisher Pack and marketplace listings
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
        {supplier ? (
          <>
            {/* Subscription Status Card */}
            <View
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 20,
                marginTop: 20,
                marginBottom: 20,
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
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "PlayfairDisplay_700Bold",
                    color: "#F7F7F5",
                  }}
                >
                  Publisher Pack
                </Text>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: `${getSubscriptionStatusColor(supplier.subscription_status)}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                      color: getSubscriptionStatusColor(
                        supplier.subscription_status,
                      ),
                      textTransform: "capitalize",
                    }}
                  >
                    {getSubscriptionStatusText(supplier.subscription_status)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#C6A15B20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: "Inter_600SemiBold",
                      color: "#C6A15B",
                    }}
                  >
                    {supplier.credits_remaining || 0}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F7F7F5",
                      marginBottom: 4,
                    }}
                  >
                    Credits Remaining
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#9CA3AF",
                    }}
                  >
                    Each approved ad costs 1 credit
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#C6A15B",
                  borderRadius: 8,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CreditCard size={16} color="#111214" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111214",
                    marginLeft: 8,
                  }}
                >
                  Manage Billing
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 30,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  canCreateAds ? router.push("/supplier/create-ad") : null
                }
                disabled={!canCreateAds}
                style={{
                  flex: 1,
                  backgroundColor: canCreateAds ? "#C6A15B" : "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  opacity: canCreateAds ? 1 : 0.6,
                }}
              >
                <Plus size={24} color={canCreateAds ? "#111214" : "#6B7280"} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: canCreateAds ? "#111214" : "#6B7280",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Create Ad
                </Text>
                {!canCreateAds && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    {supplier.subscription_status !== "active"
                      ? "Subscription required"
                      : "No credits"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/supplier/my-ads")}
                style={{
                  flex: 1,
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <FileText size={24} color="#F7F7F5" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F7F7F5",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  My Ads
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    marginTop: 4,
                  }}
                >
                  {supplierAds.length} total
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ads Overview */}
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Ads Overview
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginBottom: 30,
              }}
            >
              {[
                {
                  status: "pending",
                  label: "Pending Review",
                  color: "#F59E0B",
                  icon: Clock,
                },
                {
                  status: "approved",
                  label: "Live Ads",
                  color: "#22C55E",
                  icon: CheckCircle,
                },
                {
                  status: "rejected",
                  label: "Rejected",
                  color: "#EF4444",
                  icon: AlertCircle,
                },
                {
                  status: "draft",
                  label: "Drafts",
                  color: "#6B7280",
                  icon: FileText,
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.status}
                  onPress={() =>
                    router.push(`/supplier/my-ads?status=${item.status}`)
                  }
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
                        backgroundColor: `${item.color}20`,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <item.icon size={16} color={item.color} />
                    </View>

                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Inter_600SemiBold",
                        color: "#F7F7F5",
                      }}
                    >
                      {adsByStatus[item.status]?.length || 0}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: item.color,
                      marginBottom: 2,
                    }}
                  >
                    {item.label}
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
              Recent Activity
            </Text>

            {supplierAds.length > 0 ? (
              supplierAds.slice(0, 3).map((ad) => (
                <TouchableOpacity
                  key={ad.id}
                  onPress={() => router.push(`/supplier/ad/${ad.id}`)}
                  style={{
                    backgroundColor: "#2A2D34",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: "#F7F7F5",
                        marginBottom: 4,
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
                      backgroundColor: `${getSubscriptionStatusColor(ad.status)}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        color: getSubscriptionStatusColor(ad.status),
                        textTransform: "capitalize",
                      }}
                    >
                      {ad.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
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
                  No ads created yet. Create your first ad to get started!
                </Text>
              </View>
            )}
          </>
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
            <Package size={48} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Supplier Not Found
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
              You need to subscribe to the Publisher Pack to access the supplier
              dashboard.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/supplier/onboarding")}
              style={{
                backgroundColor: "#C6A15B",
                borderRadius: 8,
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111214",
                }}
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
