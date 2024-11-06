import { Router } from "express";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "../utils/authHelpers";
import config from "../utils/config";

export const loginRoute = Router();

loginRoute.get("/", (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  res.cookie("supabase_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
  });

  const authorizationUrl = `${config.authorizationEndpointUri}?client_id=${
    config.clientId
  }&redirect_uri=${encodeURIComponent(
    config.redirectUri
  )}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.redirect(authorizationUrl);
});
