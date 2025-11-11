import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Plus,
  X,
  Image as ImageIcon,
  Send,
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateAdScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Mock supplier ID - in real app this would come from auth context
  const mockSupplierId = 1;

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    short_description: "",
    images: [],
    price_label: "",
    location: "",
    whatsapp_enabled: false,
    whatsapp_number: "",
    content_policy_accepted: false,
  });

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Create ad mutation
  const createAdMutation = useMutation({
    mutationFn: async (adData) => {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adData),
      });
      if (!response.ok) throw new Error("Failed to create ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-ads"] });
      Alert.alert(
        "Ad Created",
        "Your ad has been submitted for review. You will be notified once it's approved.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("Missing Information", "Please enter a title for your ad.");
      return;
    }

    if (!formData.category_id) {
      Alert.alert("Missing Information", "Please select a category.");
      return;
    }

    if (!formData.short_description.trim()) {
      Alert.alert("Missing Information", "Please provide a description.");
      return;
    }

    if (formData.whatsapp_enabled && !formData.whatsapp_number.trim()) {
      Alert.alert(
        "Missing Information",
        "Please provide your WhatsApp number.",
      );
      return;
    }

    if (!formData.content_policy_accepted) {
      Alert.alert(
        "Content Policy",
        "Please accept the content policy to continue.",
      );
      return;
    }

    try {
      setLoading(true);

      await createAdMutation.mutateAsync({
        supplier_id: mockSupplierId,
        title: formData.title.trim(),
        category_id: parseInt(formData.category_id),
        short_description: formData.short_description.trim(),
        images: formData.images,
        price_label: formData.price_label.trim() || null,
        location: formData.location.trim() || null,
        whatsapp_enabled: formData.whatsapp_enabled,
        whatsapp_number: formData.whatsapp_enabled
          ? formData.whatsapp_number.trim()
          : null,
      });
    } catch (error) {
      console.error("Error creating ad:", error);
      Alert.alert("Error", "Failed to create your ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert(
      "Save Draft",
      "Draft functionality will be implemented in a future update.",
    );
  };

  const addImagePlaceholder = () => {
    if (formData.images.length < 6) {
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center`,
        ],
      }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
                Create Ad
              </Text>
            </View>

            <TouchableOpacity onPress={handleSaveDraft}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#C6A15B",
                }}
              >
                Save Draft
              </Text>
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
            Create a premium listing for the Niche+ marketplace
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Ad Title *
            </Text>

            <TextInput
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter a compelling title for your service..."
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
              }}
            />
          </View>

          {/* Category */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Category *
            </Text>

            <View style={{ gap: 8 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: category.id.toString(),
                    }))
                  }
                  style={{
                    backgroundColor: "#2A2D34",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor:
                      formData.category_id === category.id.toString()
                        ? "#C6A15B"
                        : "#2A2D34",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color:
                        formData.category_id === category.id.toString()
                          ? "#C6A15B"
                          : "#F7F7F5",
                    }}
                  >
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                        marginTop: 4,
                      }}
                    >
                      {category.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Description *
            </Text>

            <TextInput
              value={formData.short_description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, short_description: text }))
              }
              placeholder="Describe your service, expertise, and what makes you unique..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                textAlignVertical: "top",
                minHeight: 120,
              }}
            />
          </View>

          {/* Images */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Images (0-6)
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {formData.images.map((image, index) => (
                <View
                  key={index}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: "#2A2D34",
                    position: "relative",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#EF4444",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                    }}
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ImageIcon size={24} color="#6B7280" />
                  </View>
                </View>
              ))}

              {formData.images.length < 6 && (
                <TouchableOpacity
                  onPress={addImagePlaceholder}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: "#2A2D34",
                    borderWidth: 2,
                    borderColor: "#374151",
                    borderStyle: "dashed",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Plus size={24} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                marginTop: 8,
              }}
            >
              Add up to 6 high-quality images showcasing your work
            </Text>
          </View>

          {/* Price Label */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Price Label (Optional)
            </Text>

            <TextInput
              value={formData.price_label}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, price_label: text }))
              }
              placeholder="e.g., Starting from $5,000, Custom pricing, Contact for quote"
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
              }}
            />
          </View>

          {/* Location */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#F7F7F5",
                marginBottom: 12,
              }}
            >
              Location (Optional)
            </Text>

            <TextInput
              value={formData.location}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, location: text }))
              }
              placeholder="e.g., New York, London, Dubai"
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
              }}
            />
          </View>

          {/* WhatsApp */}
          <View style={{ marginTop: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F7F7F5",
                }}
              >
                Enable WhatsApp Contact
              </Text>

              <Switch
                value={formData.whatsapp_enabled}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, whatsapp_enabled: value }))
                }
                trackColor={{ false: "#374151", true: "#C6A15B80" }}
                thumbColor={formData.whatsapp_enabled ? "#C6A15B" : "#9CA3AF"}
              />
            </View>

            {formData.whatsapp_enabled && (
              <TextInput
                value={formData.whatsapp_number}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, whatsapp_number: text }))
                }
                placeholder="WhatsApp number (with country code)"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                style={{
                  backgroundColor: "#2A2D34",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            )}
          </View>

          {/* Content Policy */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  content_policy_accepted: !prev.content_policy_accepted,
                }))
              }
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: "#2A2D34",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: formData.content_policy_accepted
                    ? "#C6A15B"
                    : "#6B7280",
                  backgroundColor: formData.content_policy_accepted
                    ? "#C6A15B"
                    : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                {formData.content_policy_accepted && (
                  <Text style={{ color: "#111214", fontSize: 12 }}>✓</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#F7F7F5",
                    lineHeight: 20,
                  }}
                >
                  I agree to the Niche+ Content Policy *
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#9CA3AF",
                    lineHeight: 16,
                    marginTop: 4,
                  }}
                >
                  Your content will be reviewed for quality and compliance
                  before going live.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
            paddingTop: 20,
            backgroundColor: "#111214",
            borderTopWidth: 1,
            borderTopColor: "#2A2D34",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6B7280" : "#C6A15B",
              borderRadius: 12,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send size={20} color="#111214" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
              }}
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
