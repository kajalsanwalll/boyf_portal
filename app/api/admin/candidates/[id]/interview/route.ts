import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { scheduledAt, meetingUrl, adminNotes } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Interview date and time are required." },
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

    const interview = await prisma.$transaction(async (tx) => {
      const createdInterview = await tx.interview.create({
        data: {
          candidateId: id,
          scheduledAt: new Date(scheduledAt),
          meetingUrl: meetingUrl || null,
          adminNotes: adminNotes || null,
          type: "GOOGLE_MEET",
          status: "SCHEDULED",
        },
      });

      await tx.candidate.update({
        where: { id },
        data: {
          status: ApplicationStatus.INTERVIEW_SCHEDULED,
        },
      });

      await tx.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: ApplicationStatus.INTERVIEW_SCHEDULED,
          note: "Interview scheduled.",
        },
      });

      return createdInterview;
    });

    return NextResponse.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Interview scheduling error:", error);

    return NextResponse.json(
      { error: "Failed to schedule interview." },
      { status: 500 }
    );
  }
}