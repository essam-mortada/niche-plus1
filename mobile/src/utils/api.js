import * as SecureStore from "expo-secure-store";

// API utility for mobile app
const getBaseUrl = () => {
  // Use the proxy base URL for published apps, fallback to direct URL
  return (
    process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
    process.env.EXPO_PUBLIC_BASE_URL ||
    ""
  );
};

const getAuthHeaders = async () => {
  try {
    const authKey = "niche_plus_auth";
    const authData = await SecureStore.getItemAsync(authKey);
    if (authData) {
      const auth = JSON.parse(authData);
      return {
        Authorization: `Bearer ${auth.user?.id || auth.id}`,
      };
    }
  } catch (error) {
    console.error("Failed to get auth headers:", error);
  }
  return {};
};

export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

export const apiGet = async (endpoint) => {
  const response = await apiCall(endpoint, { method: "GET" });
  return response.json();
};

export const apiPost = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
};

export const apiPut = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
};

export const apiDelete = async (endpoint) => {
  const response = await apiCall(endpoint, { method: "DELETE" });
  return response.json();
};
