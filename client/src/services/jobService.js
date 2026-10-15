import API from "./api";

export const searchJobs = async ({
  search_term = "",
  location = "",
  job_type = "",
  work_mode = "",
  hours_old = "",
  sites = "",
  results_wanted = 100,
} = {}) => {
  const token = localStorage.getItem("token");

  const response = await API.get(
    "/jobs/search",
    {
      params: {
        search_term,
        location,
        job_type,
        work_mode,
        hours_old,
        sites,
        results_wanted,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getStoredJobs = async () => {
  const token = localStorage.getItem("token");

  const response = await API.get(
    "/jobs",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};