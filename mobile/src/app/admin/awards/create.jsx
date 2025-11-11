import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  MapPin,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiCall } from "@/utils/api";

export default function CreateAwardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    recap_links: [],
  });

  const [uploading, setUploading] = useState(false);
  const [newRecapLink, setNewRecapLink] = useState({
    title: "",
    url: "",
    description: "",
  });

  // Create award mutation
  const createAwardMutation = useMutation({
    mutationFn: async (awardData) => {
      const response = await apiCall("/api/cms/awards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(awardData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create award");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cms-awards"]);
      Alert.alert("Success", "Award created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create award");
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
      });

      if (!result.cancelled) {
        const imageUrl = await uploadImage(result.uri);
        if (imageUrl) {
          handleInputChange("cover_image", imageUrl);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddRecapLink = () => {
    if (!newRecapLink.title || !newRecapLink.url) {
      Alert.alert("Error", "Please fill in title and URL for the recap link");
      return;
    }

    const updatedRecapLinks = [...formData.recap_links, newRecapLink];
    handleInputChange("recap_links", updatedRecapLinks);
    setNewRecapLink({ title: "", url: "", description: "" });
  };

  const handleRemoveRecapLink = (index) => {
    const updatedRecapLinks = formData.recap_links.filter(
      (_, i) => i !== index,
    );
    handleInputChange("recap_links", updatedRecapLinks);
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

    createAwardMutation.mutate(formData);
  };

  const handleSaveDraft = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Award name is required to save as draft");
      return;
    }

    const draftData = { ...formData, status: "draft" };
    createAwardMutation.mutate(draftData);
  };

  const handlePublish = () => {
    const publishData = { ...formData, status: "published" };
    handleSubmit();
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ uri }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to upload image");
      return null;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111214" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
              Create Award
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSaveDraft}
            disabled={createAwardMutation.isPending}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              opacity: createAwardMutation.isPending ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
              }}
            >
              Save Draft
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
          paddingBottom: insets.bottom + 120,
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

          {/* Cover Image */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
                marginBottom: 8,
              }}
            >
              Cover Image
            </Text>
            <TouchableOpacity
              onPress={handleImageUpload}
              disabled={uploading}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: formData.cover_image ? "#C6A15B" : "#3B3B3B",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: formData.cover_image ? "#C6A15B" : "#9CA3AF",
                  textAlign: "center",
                }}
              >
                {uploading
                  ? "Uploading..."
                  : formData.cover_image
                    ? "Image uploaded"
                    : "Tap to upload cover image"}
              </Text>
            </TouchableOpacity>
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
            SEO Settings (Optional)
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

        {/* Recap Links */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "PlayfairDisplay_700Bold",
              color: "#F7F7F5",
              marginBottom: 16,
            }}
          >
            Recap Links (Optional)
          </Text>

          {/* Existing Recap Links */}
          {formData.recap_links.map((link, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F7F7F5",
                    marginBottom: 4,
                  }}
                >
                  {link.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                  }}
                >
                  {link.url}
                </Text>
                {link.description && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: "#C6A15B",
                      marginTop: 4,
                    }}
                  >
                    {link.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveRecapLink(index)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#EF444420",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 12,
                }}
              >
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New Recap Link */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            <TextInput
              style={{
                backgroundColor: "#1F1F1F",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: "#3B3B3B",
              }}
              placeholder="Link title"
              placeholderTextColor="#9CA3AF"
              value={newRecapLink.title}
              onChangeText={(text) =>
                setNewRecapLink((prev) => ({ ...prev, title: text }))
              }
            />

            <TextInput
              style={{
                backgroundColor: "#1F1F1F",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: "#3B3B3B",
              }}
              placeholder="https://example.com"
              placeholderTextColor="#9CA3AF"
              value={newRecapLink.url}
              onChangeText={(text) =>
                setNewRecapLink((prev) => ({ ...prev, url: text }))
              }
              autoCapitalize="none"
              keyboardType="url"
            />

            <TextInput
              style={{
                backgroundColor: "#1F1F1F",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                borderWidth: 1,
                borderColor: "#3B3B3B",
              }}
              placeholder="Link description (optional)"
              placeholderTextColor="#9CA3AF"
              value={newRecapLink.description}
              onChangeText={(text) =>
                setNewRecapLink((prev) => ({ ...prev, description: text }))
              }
            />

            <TouchableOpacity
              onPress={handleAddRecapLink}
              style={{
                backgroundColor: "#C6A15B",
                borderRadius: 8,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={16} color="#111214" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111214",
                  marginLeft: 6,
                }}
              >
                Add Recap Link
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#111214",
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderTopColor: "#2A2D34",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={handlePublish}
          disabled={createAwardMutation.isPending}
          style={{
            backgroundColor: "#C6A15B",
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: createAwardMutation.isPending ? 0.6 : 1,
          }}
        >
          <Save size={20} color="#111214" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#111214",
              marginLeft: 8,
            }}
          >
            {createAwardMutation.isPending ? "Creating..." : "Create & Publish"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
