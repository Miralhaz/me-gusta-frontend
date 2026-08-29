// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080",
//   withCredentials: true, // Permite o envio de cookies nas requisições
// });

// export function sair(navigate) {
//   document.cookie = 'token=; path=/; max-age=0'
//   navigate('/login')
// }

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      document.cookie = 'token=; path=/; max-age=0';
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function sair(navigate) {
  document.cookie = 'token=; path=/; max-age=0';
  navigate('/login');
}

export default api;