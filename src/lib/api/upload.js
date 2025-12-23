import api from '../axios';

export const uploadApi = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
