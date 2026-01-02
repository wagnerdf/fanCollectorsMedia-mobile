import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp: number;
};

export function getTokenExpiration(token: string): Date {
  const decoded = jwtDecode<JwtPayload>(token);
  return new Date(decoded.exp * 1000);
}

export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  return expiration.getTime() <= Date.now();
}
