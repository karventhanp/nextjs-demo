import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createApiResponse, getErrorMessage } from "@/helpers/helper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const logoutUrl = `${
    process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER
  }/protocol/openid-connect/logout?client_id=${
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_NAME
  }&post_logout_redirect_uri=${
    process.env.KEYCLOAK_LOGOUT_CALLBACK
  }&id_token_hint=${searchParams.get("id_token_hint")}`;
  try {
    const result = await axios.get(logoutUrl);
    return NextResponse.json(
      createApiResponse(result.status, result.statusText, result.data)
    );
  } catch (error) {
    console.error("Error on logout :: ", error);
    return NextResponse.json(
      createApiResponse(500, getErrorMessage(error), null)
    );
  }
}
