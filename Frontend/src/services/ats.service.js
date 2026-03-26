import api from './api';

export const atsService = {
  checkAts: async (formData) => {
    // formData must contain the 'resume' file and 'jobDescription' text
    const response = await api.post('/ats/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  improveResume: async (data) => {
    // data should contain { currentContent, jobDescription, focusArea }
    const response = await api.post('/ats/improve', data);
    return response.data;
  },
};
