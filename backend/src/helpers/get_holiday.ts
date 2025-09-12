import axios from "axios";

export async function get_holidays() {
 const { HOLIDAY_ENDPOINT } = process.env;
  try {
    const res = await axios.get(`${HOLIDAY_ENDPOINT}`);
    return res.data;

  } catch (error) {
    console.error(`Faild to fetch the Holiday from API:`, error);
    return null; // Return null on failure
  }
}
