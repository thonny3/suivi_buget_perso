import api from "../lib/axios";

// Récupérer tous les bugets
export const getAll = async () => {
  const res = await api.get("/budgets");
  return res.data;
};

export const add = async (data) => {
  const res = await api.post("/budgets",data);
  return res.data;
};

