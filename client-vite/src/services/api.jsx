import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// Register API
export const registerUser = (userData) => API.post("/auth/register", userData);

// Login API
export const loginUser = (credentials) => API.post("/auth/login", credentials);
