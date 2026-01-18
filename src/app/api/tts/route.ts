import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Valid voices for TTS
const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = (typeof VALID_VOICES)[number];

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, voice = "nova", speed = 1 } = body;

    // Validate text
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    if (text.length > 500) {
      return NextResponse.json(
        { error: "Text too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Validate voice
    const selectedVoice: Voice = VALID_VOICES.includes(voice as Voice)
      ? (voice as Voice)
      : "nova";

    // Validate speed (0.25 to 4.0)
    const selectedSpeed = Math.max(0.25, Math.min(4.0, Number(speed) || 1));

    // Generate speech using OpenAI
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: text,
      speed: selectedSpeed,
    });

    // Get audio buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Return audio with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        // Cache for 24 hours (same text = same audio)
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    console.error("TTS API error:", error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json(
      { error: "Text parameter required", usage: "/api/tts?text=Hello" },
      { status: 400 }
    );
  }

  // Forward to POST handler
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    })
  );
}
