import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const searchPlaces = async (query) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'in', // Restrict to India for this fleet
      },
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getRoute = async (start, end) => {
  // Using OSRM (Open Source Routing Machine) public instance
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  try {
    const response = await axios.get(url);
    return response.data.routes[0];
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
};
