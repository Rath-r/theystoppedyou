import { auth } from "@/src/auth";

export { auth as middleware };

export const config = {
  matcher: ["/dashboard/:path*", "/api/stops/:path*"],
};
