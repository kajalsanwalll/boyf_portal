import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const interview = await prisma.interview.findFirst({
      where: {
        candidateId: id,
        status: "SCHEDULED",
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "No scheduled interview found." },
        { status: 404 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.interview.update({
        where: {
          id: interview.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      await tx.candidate.update({
        where: {
          id,
        },
        data: {
          status: ApplicationStatus.INTERVIEW_COMPLETED,
        },
      });

      await tx.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: ApplicationStatus.INTERVIEW_COMPLETED,
          note: "Interview completed.",
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Interview completion error:", error);

    return NextResponse.json(
      { error: "Failed to complete interview." },
      { status: 500 }
    );
  }
}