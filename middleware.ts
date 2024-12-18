// middleware.js
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/login", "/products", "/auction", "/signup", "/", "/dashboard"], // Specify routes to run middleware on
};

export async function middleware(req) {
  const res = NextResponse.next();
  console.log("in middleware");

  const cookies = req.cookies.getAll();
  const authTokenCookie = cookies.find((cookie) => cookie.name.endsWith("access_token"));
  const role = cookies.find((cookie) => cookie.name.endsWith("role"));
  const roleValue = role ? role.value : null;

  console.log("Uttoken", authTokenCookie, req.nextUrl.pathname);
  console.log("role", role);

  const protectedRoutes = ["/products", "/auction", "/dashboard"];
  const authRoutes = ["/", "/login", "/signup"];

  if (!authTokenCookie && protectedRoutes.includes(req.nextUrl.pathname)) {
    console.log("Redirecting to login due to missing token on protected route");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (authTokenCookie && authRoutes.includes(req.nextUrl.pathname)) {
    console.log("Authenticated user attempting to access login");

    if (roleValue === "bidder") {
      console.log("Redirecting bidder to auction page");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else if (roleValue === "seller") {
      console.log("Redirecting seller to products page");
      return NextResponse.redirect(new URL("/products", req.url));
    }
  }

  return res;
}
