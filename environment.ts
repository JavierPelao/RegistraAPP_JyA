import { config } from 'dotenv';

// Cargar archivo .env
config();

export const environment = {
    production: false,
    apiUrl: 'https://www.presenteprofe.cl/api/v1', // Agrega la propiedad apiUrl
  };