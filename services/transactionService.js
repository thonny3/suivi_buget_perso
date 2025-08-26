import api from "../lib/axios";

// ajout  depenses
export const addDepenses = async (data) => {
  const res = await api.post("/depenses",data);
  return res.data;
};

// Récupérer tous les utilisateurs

export const addRevenues = async (data) => {
  const res = await api.post("/revenus",data);
  return res.data;
};

//Recupérer toutes les transactions
export const getTransactions = async () => {
    const res = await api.get("/transactions");
    console.log("✅ Transactions récupérées :", res.data);
    return res.data;
}