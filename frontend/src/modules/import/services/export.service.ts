import api from '../../../services/api';

export const exportService = {
  exportBookmarks: async (format: 'html' | 'json'): Promise<void> => {
    const response = await api.get('/export', {
      params: { format },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookmarks_export.${format}`);
    document.body.appendChild(link);
    link.click();
    
    // cleanup
    if (link.parentNode) link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
