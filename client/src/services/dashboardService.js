import API from "./api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getDashboardJobs = async ({
  search_term = "",
  location = "",
  limit = 500,
} = {}) => {
  const response = await API.get("/jobs/search", {
    params: {
      search_term,
      location,
      results_wanted: limit,
    },
    headers: authHeaders(),
  });
  return response.data;
};

export const getDashboardFilters = async () => {
  const response = await API.get("/dashboard/filters", {
    headers: authHeaders(),
  });
  return response.data;
};
