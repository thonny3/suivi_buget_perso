import api from "../lib/axios";

// Récupérer tous les utilisateurs
export const getAllCategoriesRevenues = async () => {
  const res = await api.get("/revenus");
  return res.data;
};
