import API from '../../../utils/api';

const contactAPI = {
  submitContactForm: async (formData) => {
    const response = await API.post("/contact", formData);
    return response.data;
  },

  getContactInfo: async () => {
    const response = await API.get("/contact/info");
    return response.data;
  },
};

export default contactAPI;