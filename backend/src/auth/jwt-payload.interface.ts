/** Shape of the JWT payload issued on login */
export interface JwtPayload {
  /** Subject: user UUID */
  sub: string;
  email: string;
}
