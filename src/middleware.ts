import { auth } from "@/src/auth";

export default auth((req) => {
  if (!req.auth?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  return undefined;
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/stops/:path*"],
};
