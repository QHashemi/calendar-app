import { callGraph, getToken } from "../config/msalConfig";

export default async function get_office_user_calendar(userEmail: string) {
  try {
    // Get events from Microsoft Graph
    const token = await getToken();
    const data = await callGraph(`/users/${userEmail}/events`, token);
    const events = data.value;
    return events;
  } catch (error) {
    console.error(`Failed to get calendar for ${userEmail}:`, error);
    return []; // Return empty array on failure
  }
}

export async function get_office_user(userEmail: string) {
  const fields = "id,displayName,mail,jobTitle,businessPhones,mobilePhone,givenName,surname,officeLocation,streetAddress,city,state,postalCode,country,usageLocation";

  try {
    const token = await getToken();
    const data = await callGraph(`/users/${userEmail}?$select=${fields}`, token);
    return data;
  } catch (error) {
    console.error(`Failed to get user info for ${userEmail}:`, error);
    return null; // Return null on failure
  }
}
