import axios from "axios";

const api = axios.create({
  baseURL: "https://edtech-backend-1-f3zs.onrender.com",
});

export default api;

