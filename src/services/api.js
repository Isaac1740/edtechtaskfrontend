import axios from "axios";

const api = axios.create({
  baseURL: "https://edtech-backend-0q1u.onrender.com",
});

export default api;
