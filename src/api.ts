import axios from "axios";

// Create reusable Axios instance with baseURL pointing to our server and credentials enabled
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Crucial for HTTP-only JWT cookies to be sent automatically
});

// Response interceptor to catch 401 errors globally and redirect or reset auth state if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthenticated requests are handled elegantly in our AuthContext or ProtectedRoutes
      console.warn("Unauthenticated request caught by Axios interceptor.");
    }
    return Promise.reject(error);
  }
);

export default api;
