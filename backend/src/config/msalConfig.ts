
import axios from "axios";
import dotenv from "dotenv";
import msal from "@azure/msal-node";

dotenv.config();

const { CLIENT_ID, CLIENT_SECRET, TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID || !AAD_ENDPOINT || !GRAPH_ENDPOINT) {
    throw new Error("Missing required env vars");
}

const msalConfig: msal.Configuration = {
    auth: {
        clientId: CLIENT_ID,
        authority: `${AAD_ENDPOINT}/${TENANT_ID}`,
        clientSecret: CLIENT_SECRET,
    },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getToken(): Promise<string> {
    const result = await cca.acquireTokenByClientCredential({
        scopes: [`${GRAPH_ENDPOINT}/.default`],
    });
    if (!result?.accessToken) throw new Error("Failed to get token");
    return result.accessToken;
}

async function callGraph(endpoint: string, token: string) {
    const res = await axios.get(`${GRAPH_ENDPOINT}/v1.0${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // axios already parses JSON
}

export { getToken, callGraph };
