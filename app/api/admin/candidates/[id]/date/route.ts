import { prisma } from "@/lib/prisma";
import {
  ApplicationStatus,
  DateType,
} from "@prisma/client";
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

    const {
      scheduledAt,
      meetingUrl,
      type,
      prompt,
      privateNotes,
    } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Date and time are required." },
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

    const dateType = Object.values(DateType).includes(type)
      ? type
      : DateType.ONLINE;

    const date = await prisma.$transaction(async (tx) => {
      const createdDate = await tx.date.create({
        data: {
          candidateId: id,
          scheduledAt: new Date(scheduledAt),
          meetingUrl: meetingUrl || null,
          type: dateType,
          prompt: prompt || null,
          privateNotes: privateNotes || null,
          status: "SCHEDULED",
        },
      });

      await tx.candidate.update({
        where: {
          id,
        },
        data: {
          status: ApplicationStatus.DATE_SCHEDULED,
        },
      });

      await tx.applicationEvent.create({
        data: {
          candidateId: id,
          fromStatus: candidate.status,
          toStatus: ApplicationStatus.DATE_SCHEDULED,
          note: "Date scheduled.",
        },
      });

      return createdDate;
    });

    return NextResponse.json({
      success: true,
      date,
    });
  } catch (error) {
    console.error("Date scheduling error:", error);

    return NextResponse.json(
      { error: "Failed to schedule date." },
      { status: 500 }
    );
  }
}