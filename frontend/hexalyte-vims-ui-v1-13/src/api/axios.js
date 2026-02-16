import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4444/v1/"

const axiosInstance = axios.create({
  baseURL: BASE_URL
})

export default axiosInstance;