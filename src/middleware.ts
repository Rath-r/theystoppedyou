import NextAuth from "next-auth";
import authConfig from "@/src/auth.config";

// Inicializujeme NextAuth čisto len s configom bez databázového adaptéra
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Middleware len na pozadí skontroluje/overí session token.
  // Chrániť konkrétne cesty môžeš priamo tu alebo v page/api súboroch.
  return;
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/stops/:path*"],
};
