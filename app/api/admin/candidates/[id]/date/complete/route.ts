import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const date = await prisma.date.findFirst({
      where: {
        candidateId: id,
        status: "SCHEDULED",
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    if (!date) {
      return NextResponse.json(
        { error: "No scheduled date found." },
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
      await tx.date.update({
        where: {
          id: date.id,
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
          status: ApplicationStatus.DATE_COMPLETED,
        },
      });

      await tx.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: ApplicationStatus.DATE_COMPLETED,
          note: "Date completed.",
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Date completion error:", error);

    return NextResponse.json(
      { error: "Failed to complete date." },
      { status: 500 }
    );
  }
}