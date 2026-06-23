import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "x-api-key": "slaptas_raktas",
    "Content-Type": "application/json",
  },
});

export default api;
