import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const body = await request.json();

    const decision = body.decision as ApplicationStatus;
    const note = body.note as string | undefined;

    if (
      decision !== ApplicationStatus.ACCEPTED &&
      decision !== ApplicationStatus.REJECTED
    ) {
      return NextResponse.json(
        { error: "Invalid final decision." },
        { status: 400 }
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
      await tx.candidate.update({
        where: {
          id,
        },
        data: {
          status: decision,
        },
      });

      await tx.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: decision,
          note:
            note ??
            (decision === ApplicationStatus.ACCEPTED
              ? "Candidate accepted."
              : "Application closed after final review."),
        },
      });
    });

    return NextResponse.json({
      success: true,
      status: decision,
    });
  } catch (error) {
    console.error("Final decision error:", error);

    return NextResponse.json(
      { error: "Failed to save final decision." },
      { status: 500 }
    );
  }
}