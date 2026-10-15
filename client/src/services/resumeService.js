const API = "http://localhost:5000/api/resume";

const getToken = () => localStorage.getItem("token");

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(API, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

export const parseResume = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/api/resume/parse",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to parse resume");
  }

  return data;
};

export const deleteResume = async () => {
  const response = await fetch(API, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};