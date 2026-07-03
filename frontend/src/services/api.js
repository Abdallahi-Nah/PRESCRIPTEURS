import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Prescripteurs
export const getPrescripteurs = (params) => api.get('/prescripteurs', { params });
export const addPrescripteur = (data) => api.post('/prescripteurs', data);
export const updatePrescripteur = (id, data) => api.put(`/prescripteurs/${id}`, data);
export const deletePrescripteur = (id) => api.delete(`/prescripteurs/${id}`);
export const importPrescripteurs = (formData) => api.post('/prescripteurs/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
