// app/api/gemini/route.js
import { URL } from "@/app/constants";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // Replace with your actual Gemini API key and endpoint
  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCF2cG4mkMYbKCYg_04GaxEQDXk1sPhYg4";

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
