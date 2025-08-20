import api from "../lib/axios";

// Récupérer tous les utilisateurs
export const getComptes = async () => {
  const res = await api.get("/comptes/mycompte/user");
  console.log("✅ Comptes récupérés :", res.data);
  return res.data;
};

export const createComptes = async (data) => {
  const res = await api.post("/comptes", data);
  console.log("✅ Compte créé :", res.data);
  return res.data;
}
