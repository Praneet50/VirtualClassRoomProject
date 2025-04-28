import axios from "axios";

const API = axios.create({
  baseURL: "https://virtualclassroomproject.onrender.com",
});

// Register API
export const registerUser = (userData) =>
  API.post(
    "https://virtualclassroomproject.onrender.com/auth/register",
    userData
  );

// Login API
export const loginUser = (credentials) =>
  API.post(
    "https://virtualclassroomproject.onrender.com/auth/login",
    credentials
  );
