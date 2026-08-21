import api from '../../../services/api';

export const importService = {
  importHtml: async (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
