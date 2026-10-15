import API from "./api";

// Get Logged-in User Profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await API.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Update User Profile
export const updateProfile = async (profileData) => {

  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/api/profile",
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  return data;
};
// Upload Profile Photo
export const uploadProfilePhoto = async (photo) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("photo", photo);

  const response = await API.post(
    "/profile-photo/upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
// Remove Profile Photo
export const removeProfilePhoto = async () => {

  const token = localStorage.getItem("token");

  const response = await API.delete(
    "/profile/photo",
    {
      headers:{
        Authorization:`Bearer ${token}`,
      },
    }
  );

  return response.data;
};