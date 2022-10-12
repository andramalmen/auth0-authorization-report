import dotenv from 'dotenv';

dotenv.config();
const { API_HOST, CLIENT_ID, CLIENT_SECRET, AUDIENCE, APP_HOST } = process.env;

export const getAccessToken = async () => {
  const body = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience: AUDIENCE,
    grant_type: 'client_credentials',
  };
  const response = await fetch(`${APP_HOST}/oauth/token`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return data.access_token;
};

type Resource = 'groups' | 'roles' | 'permissions';

export const getAuthData = async (resource: Resource) => {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_HOST}/${resource}`, {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
};
