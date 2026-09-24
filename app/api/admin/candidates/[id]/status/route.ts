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

    const body = await request.json();

    const newStatus = body.status as ApplicationStatus;
    const note = body.note as string | undefined;

    if (!Object.values(ApplicationStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        id,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      );
    }

    if (candidate.status === newStatus) {
      return NextResponse.json({
        success: true,
        message: "Candidate already has this status.",
      });
    }

    await prisma.$transaction([
      prisma.candidate.update({
        where: {
          id,
        },
        data: {
          status: newStatus,
        },
      }),

      prisma.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: newStatus,
          note,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error("Status update error:", error);

    return NextResponse.json(
      { error: "Failed to update candidate status." },
      { status: 500 }
    );
  }
}