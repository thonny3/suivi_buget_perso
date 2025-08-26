import api from "../lib/axios";

// Récupérer categorie depense
export const categorieDepense = async () => {
  const res = await api.get("/categories/depenses");
  return res.data;
};

// Récupérer categorie revenu
export const categorieRevenu = async () => {
  const res = await api.get("/categories/revenues");
  return res.data;
};

