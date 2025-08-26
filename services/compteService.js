import api from "../lib/axios";

// Récupérer tous les utilisateurs
export const getComptes = async () => {
  const res = await api.get("/comptes/mycompte/user");
  console.log("✅ Comptes récupérés :", res.data);
  return res.data;
};

export const createComptes = async (data) => {
  const res = await api.post("/comptes", data);
  console.log(res.data);

  return res;
}

export const modifiComptes = async (data, id) => {
  const res = await api.put(`/comptes/${id}`, data);
  console.log("✅ Compte créé :", res.data);
  return res;
}

export const deleteComptes = async (id) => {
  const res = await api.delete(`/comptes/${id}`);
  console.log("✅ Compte créé :", res.data);
  return res;
}

export const comptesPartageIndex = async (id) => {
  const res = await api.get(`/comptes-partages/compte/${id}`);
  console.log("✅ Compte créé :", res.data);
  return res;
}

export const createComptePartage = async (data) => {
  const res = await api.post("/comptes-partages", data);
  console.log(res.data);
  return res;
}

export const  modifierRoleCromptePartage = async (id, data) => {
  const res = await api.put(`/comptes-partages/${id}`, data);
  console.log("✅ Compte créé :", res.data);
  return res;
}


export const deleteComptesPartage = async (id) => {
  const res = await api.delete(`/comptes-partages/${id}`);
  console.log("✅ Compte créé :", res.data);
  return res;
}

