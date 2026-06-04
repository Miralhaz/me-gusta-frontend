import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Permite o envio de cookies nas requisições
});

export default api;