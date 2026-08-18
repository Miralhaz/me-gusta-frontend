import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Permite o envio de cookies nas requisições
});

export function sair(navigate) {
  document.cookie = 'token=; path=/; max-age=0'
  navigate('/login')
}

export default api;