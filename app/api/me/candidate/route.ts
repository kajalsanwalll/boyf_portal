import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        hasApplication: false,
      });
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      hasApplication: Boolean(candidate),
      candidateId: candidate?.id ?? null,
    });
  } catch (error) {
    console.error("Failed to check candidate:", error);

    return NextResponse.json(
      {
        authenticated: false,
        hasApplication: false,
      },
      { status: 500 }
    );
  }
}