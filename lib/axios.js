import axios from "axios";

// Créer une instance Axios
const api = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter un token (si tu utilises JWT)
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
