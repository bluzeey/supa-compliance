export default {
  clientId: process.env.SUPA_CONNECT_CLIENT_ID!,
  authorizationEndpointUri: "https://api.supabase.com/v1/oauth/authorize",
  redirectUri: process.env.SUPA_REDIRECT_URI!,
};
