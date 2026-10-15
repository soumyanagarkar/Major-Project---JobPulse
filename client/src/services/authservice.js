import API from "./api";

export const signupUser = (data) => {
    return API.post("/auth/signup", data);
};

export const loginUser = (data) => {
    return API.post("/auth/login", data);
};