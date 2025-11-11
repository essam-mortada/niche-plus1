import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Save } from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiCall } from "@/utils/api";

export default function EditAwardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    venue: "",
    event_date: "",
    cover_image: "",
    summary: "",
    long_description: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
  });

  // Fetch existing award data
  const { data: awardData, isLoading } = useQuery({
    queryKey: ["award", id],
    queryFn: async () => {
      const response = await apiCall(`/api/cms/awards/${id}`);
      if (!response.ok) throw new Error("Failed to fetch award");
      return response.json();
    },
    enabled: !!id,
  });

  // Update award mutation
  const updateAwardMutation = useMutation({
    mutationFn: async (awardData) => {
      const response = await apiCall(`/api/cms/awards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(awardData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update award");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cms-awards"]);
      queryClient.invalidateQueries(["award", id]);
      Alert.alert("Success", "Award updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update award");
    },
  });

  // Populate form when award data is loaded
  useEffect(() => {
    if (awardData?.award) {
      const award = awardData.award;
      setFormData({
        name: award.name || "",
        country: award.country || "",
        city: award.city || "",
        venue: award.venue || "",
        event_date: award.event_date ? award.event_date.split("T")[0] : "",
        cover_image: award.cover_image || "",
        summary: award.summary || "",
        long_description: award.long_description || "",
        status: award.status || "draft",
        seo_title: award.seo_title || "",
        seo_description: award.seo_description || "",
      });
    }
  }, [awardData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert("Error", "Award name is required");
      return;
    }

    if (!formData.country.trim()) {
      Alert.alert("Error", "Country is required");
      return;
    }

    if (!formData.city.trim()) {
      Alert.alert("Error", "City is required");
      return;
    }

    if (!formData.event_date.trim()) {
      Alert.alert("Error", "Event date is required");
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.event_date)) {
      Alert.alert("Error", "Please enter date in YYYY-MM-DD format");
      return;
    }

    updateAwardMutation.mutate(formData);
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
          }}
        >
          Loading award...
        </Text>
      </View>
    );
  }

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
              Edit Award
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={updateAwardMutation.isPending}
            style={{
              backgroundColor: "#C6A15B",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              opacity: updateAwardMutation.isPending ? 0.6 : 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Save size={16} color="#111214" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
                marginLeft: 6,
              }}
            >
              {updateAwardMutation.isPending ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Basic Information
          </Text>

          {/* Award Name */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Award Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.name ? "#C6A15B" : "#3B3B3B",
              }}
              placeholder="Enter award name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              autoCapitalize="words"
            />
          </View>

          {/* Country & City */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Country *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  borderWidth: 1,
                  borderColor: formData.country ? "#C6A15B" : "#3B3B3B",
                }}
                placeholder="Country"
                placeholderTextColor="#9CA3AF"
                value={formData.country}
                onChangeText={(text) => handleInputChange("country", text)}
                autoCapitalize="words"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                City *
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                  borderWidth: 1,
                  borderColor: formData.city ? "#C6A15B" : "#3B3B3B",
                }}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                value={formData.city}
                onChangeText={(text) => handleInputChange("city", text)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Venue */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Venue
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.venue ? "#C6A15B" : "#3B3B3B",
              }}
              placeholder="Event venue"
              placeholderTextColor="#9CA3AF"
              value={formData.venue}
              onChangeText={(text) => handleInputChange("venue", text)}
              autoCapitalize="words"
            />
          </View>

          {/* Event Date */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Event Date *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.event_date ? "#C6A15B" : "#3B3B3B",
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={formData.event_date}
              onChangeText={(text) => handleInputChange("event_date", text)}
            />
          </View>

          {/* Status */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Status
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleInputChange("status", "draft")}
                style={{
                  flex: 1,
                  backgroundColor:
                    formData.status === "draft" ? "#C6A15B" : "#2A2D34",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: formData.status === "draft" ? "#111214" : "#F7F7F5",
                  }}
                >
                  Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleInputChange("status", "published")}
                style={{
                  flex: 1,
                  backgroundColor:
                    formData.status === "published" ? "#C6A15B" : "#2A2D34",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color:
                      formData.status === "published" ? "#111214" : "#F7F7F5",
                  }}
                >
                  Published
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Description
          </Text>

          {/* Summary */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Summary
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.summary ? "#C6A15B" : "#3B3B3B",
                minHeight: 80,
                textAlignVertical: "top",
              }}
              placeholder="Brief summary of the award"
              placeholderTextColor="#9CA3AF"
              value={formData.summary}
              onChangeText={(text) => handleInputChange("summary", text)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Long Description */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Full Description
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.long_description ? "#C6A15B" : "#3B3B3B",
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholder="Detailed description of the award event"
              placeholderTextColor="#9CA3AF"
              value={formData.long_description}
              onChangeText={(text) =>
                handleInputChange("long_description", text)
              }
              multiline
              numberOfLines={5}
            />
          </View>
        </View>

        {/* SEO */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            SEO Settings
          </Text>

          {/* SEO Title */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              SEO Title
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.seo_title ? "#C6A15B" : "#3B3B3B",
              }}
              placeholder="SEO-friendly title"
              placeholderTextColor="#9CA3AF"
              value={formData.seo_title}
              onChangeText={(text) => handleInputChange("seo_title", text)}
            />
          </View>

          {/* SEO Description */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              SEO Description
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: formData.seo_description ? "#C6A15B" : "#3B3B3B",
                minHeight: 80,
                textAlignVertical: "top",
              }}
              placeholder="SEO description for search engines"
              placeholderTextColor="#9CA3AF"
              value={formData.seo_description}
              onChangeText={(text) =>
                handleInputChange("seo_description", text)
              }
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
