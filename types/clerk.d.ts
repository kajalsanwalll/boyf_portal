import "@clerk/types";

declare module "@clerk/types" {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: string;
    };
  }
}