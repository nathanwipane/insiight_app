export { auth as proxy } from "@/lib/authOptions"

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|signin|register|render).*)"]
}