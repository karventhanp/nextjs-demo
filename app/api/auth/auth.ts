import axios from "axios";
import { Account, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import Keycloak from "next-auth/providers/keycloak";
import {
  getRoles,
  getOrganization,
  getAssignedCustomers,
} from "../../../helpers/helper";

const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_NAME;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;

export const authOptions: NextAuthOptions = {
  providers: [
    Keycloak({
      clientId: clientId!,
      clientSecret: clientSecret!,
      issuer: issuer!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account: Account | null;
    }): Promise<JWT> {
      if (account) {
        token.roles = getRoles(account.access_token, clientId);
        token.organization = getOrganization(account.access_token);
        token.assigned_customers = getAssignedCustomers(account.access_token);
        return {
          ...token,
          access_token: account.access_token!,
          refresh_token: account.refresh_token,
          id_token: account.id_token,
          sub: account.userId || token.sub,
          expires_at: account.expires_at!,
        };
      } else if (Date.now() < token.expires_at * 1000) {
        try {
          const response = await axios.post(
            `${issuer}/protocol/openid-connect/token/introspect`,
            new URLSearchParams({
              token: token.access_token!,
              client_id: clientId!,
              client_secret: clientSecret!,
            }).toString()
          );
          if (!response.data.active) {
            throw "Token is inactive or invalid";
          }
        } catch (error) {
          console.error("Error while validating token", error);
          token.error = "RefreshTokenError";
        }
        return { ...token, sub: token.sub || "" };
      } else {
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");
        try {
          const response = await axios.post(
            `${issuer}/protocol/openid-connect/token`,
            new URLSearchParams({
              client_id: clientId!,
              client_secret: clientSecret!,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token!,
            }).toString()
          );
          const tokensOrError = response.data;

          if (response.status !== 200) {
            throw tokensOrError;
          }
          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
            id_token: string;
            sub?: string;
          };
          token.access_token = newTokens.access_token;
          token.id_token = newTokens.id_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in
          );
          token.sub = newTokens.sub || token.sub;
          token.roles = getRoles(newTokens.access_token, clientId);
          token.organization = getOrganization(newTokens.access_token);
          if (newTokens.refresh_token) {
            token.refresh_token = newTokens.refresh_token;
          }
          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.sub = token.sub;
      if (session.user) {
        session.user.roles = token.roles;
      }
      session.organization = token.organization;
      session.assignedCustomers = token.assigned_customers;
      return session;
    },
  },
};
