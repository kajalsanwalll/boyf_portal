import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const photoUrl = body.photoUrl;

    if (typeof photoUrl !== "string" || !photoUrl.trim()) {
      return NextResponse.json(
        {
          error: "A valid photo URL is required.",
        },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.update({
      where: {
        id,
      },
      data: {
        photoUrl: photoUrl.trim(),
      },
      select: {
        id: true,
        photoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error("Candidate photo update error:", error);

    return NextResponse.json(
      {
        error: "Failed to update candidate photo.",
      },
      { status: 500 }
    );
  }
}