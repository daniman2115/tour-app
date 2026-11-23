import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/users\/?$/, "");
const PLACES_URL = `${BASE_URL}/api/places`;

export const fetchPlaces = async (params = {}) => {
  const response = await axios.get(PLACES_URL, { params });
  return response.data;
};

export const fetchPlaceById = async (id) => {
  const response = await axios.get(`${PLACES_URL}/${id}`);
  return response.data;
};

export const fetchGuidesForPlace = async (placeId) => {
  const response = await axios.get(`${PLACES_URL}/${placeId}/guides`);
  return response.data;
};

export const fetchTopGuides = async () => {
  const response = await axios.get(`${PLACES_URL}/guides/top`);
  return response.data;
};

export const seedPlaces = async (places) => {
  const response = await axios.post(`${PLACES_URL}/seed`, { places });
  return response.data;
};
