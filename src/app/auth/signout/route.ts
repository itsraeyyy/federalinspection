import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const referer = request.headers.get("referer") || "";
  const redirectTo = request.nextUrl.searchParams.get("redirect_to");

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  }

  if (referer.includes("/representative") || referer.includes("/rep")) {
    return NextResponse.redirect(new URL("/representative/login", request.url), { status: 303 });
  } else if (referer.includes("/assessment")) {
    return NextResponse.redirect(new URL("/assessment/login", request.url), { status: 303 });
  } else if (referer.includes("/complaint")) {
    return NextResponse.redirect(new URL("/complaint/login", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/representative/login", request.url), { status: 303 });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
