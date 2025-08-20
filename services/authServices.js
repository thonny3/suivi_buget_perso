import api from "../lib/axios";

// Récupérer tous les utilisateurs
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// Créer un utilisateur
export const signUser = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// Connexion utilisateur
export const loginUser = async (data) => {
  try {
    const res = await api.post("/users/login", data);
    return res.data; // retourne { message, token }
  } catch (err) {
    if (err.response && err.response.data) {
      // On lance l'erreur pour que le catch côté front la récupère
      throw err;
    } else {
      throw new Error(err.message);
    }
  }
};
