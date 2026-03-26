import api from './api';

export const dashboardService = {
  getDashboardData: async (limit = 3) => {
    const response = await api.get(`/dashboard/data?limit=${limit}`);
    return response.data; // { activities, totalActivities, usages }
  }
};
