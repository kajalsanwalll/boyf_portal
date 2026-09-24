import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const candidateIds: string[] = body.candidateIds;
    const status: ApplicationStatus = body.status;

    if (!Array.isArray(candidateIds) || !candidateIds.length) {
      return NextResponse.json(
        { error: "No candidates selected." },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(
      ApplicationStatus
    );

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    await prisma.candidate.updateMany({
      where: {
        id: {
          in: candidateIds,
        },
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      updated: candidateIds.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update candidates." },
      { status: 500 }
    );
  }
}