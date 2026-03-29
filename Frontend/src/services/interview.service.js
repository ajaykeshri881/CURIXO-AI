import api from './api';

export const interviewService = {
  generateInterviewReport: async (formData) => {
    // formData must contain 'resume' file, 'jobDescription', 'selfDescription'
    const response = await api.post('/interview/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getInterviewReportById: async (interviewId) => {
    const response = await api.get(`/interview/report/${interviewId}`);
    return response.data;
  },
};
