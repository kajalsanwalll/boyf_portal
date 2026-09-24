import { prisma } from "@/lib/prisma";
import CandidatesTable from "@/components/admin/candidates-table";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      age: true,
      city: true,
      occupation: true,
      relationshipIntent: true,
      compatibilityScore: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#fff8f5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#e94f64]">
            Boyfriend Recruitment HQ
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#171717]">
            Candidate Review
          </h1>

          <p className="mt-2 text-[#746f70]">
            250 applicants. One position. Questionable hiring standards.
          </p>
        </div>

        <CandidatesTable candidates={candidates} />
      </div>
    </main>
  );
}