import api from './api';

export const resumeService = {
  createFromScratch: async (resumeData) => {
    const response = await api.post('/resume/create-from-scratch', resumeData);
    return response.data;
  },

  downloadPdfFromScratch: async (resumeData) => {
    const response = await api.post('/resume/create-from-scratch/pdf', resumeData, {
      responseType: 'blob', // Important for handling binary file downloads
    });
    return response.data;
  },
};
