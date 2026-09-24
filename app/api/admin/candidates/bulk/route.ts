import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const candidateIds: string[] = body.candidateIds;
    const status: ApplicationStatus = body.status;
    const note: string | undefined = body.note;

    // Validate candidate IDs
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: "No candidates selected." },
        { status: 400 }
      );
    }

    // Remove duplicates
    const uniqueCandidateIds = [...new Set(candidateIds)];

    // Validate status
    const validStatuses = Object.values(ApplicationStatus);

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    // Find selected candidates first so we know their
    // previous status for the timeline event.
    const candidates = await prisma.candidate.findMany({
      where: {
        id: {
          in: uniqueCandidateIds,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No matching candidates found." },
        { status: 404 }
      );
    }

    // Only create timeline events for candidates
    // whose status actually changes.
    const changedCandidates = candidates.filter(
      (candidate) => candidate.status !== status
    );

    if (changedCandidates.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: "All selected candidates already have this status.",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Update candidates
      await tx.candidate.updateMany({
        where: {
          id: {
            in: changedCandidates.map(
              (candidate) => candidate.id
            ),
          },
        },
        data: {
          status,
        },
      });

      // Create one timeline event per candidate
      await tx.applicationEvent.createMany({
        data: changedCandidates.map((candidate) => ({
          candidateId: candidate.id,
          fromStatus: candidate.status,
          toStatus: status,
          note:
            note ??
            `Bulk action: candidate moved to ${status
              .replaceAll("_", " ")
              .toLowerCase()}.`,
        })),
      });
    });

    return NextResponse.json({
      success: true,
      updated: changedCandidates.length,
    });
  } catch (error) {
    console.error("Bulk candidate update error:", error);

    return NextResponse.json(
      { error: "Failed to update candidates." },
      { status: 500 }
    );
  }
}