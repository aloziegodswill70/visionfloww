import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Authentication and authorization are handled
    // by the callbacks below.
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },

    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/clinic/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/whatsapp/:path*",
    "/automations/:path*",
    "/settings/:path*",
  ],
};