import { prisma } from "@/lib/prisma";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  city: string | null;
  occupation: string | null;
  relationshipIntent: string | null;
  compatibilityScore: number | null;
  status: string;
  createdAt: Date;
};

function CandidatesTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#f0deda] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[#f0deda] text-left text-sm">
        <thead className="bg-[#fff1ed] text-xs uppercase tracking-wide text-[#746f70]">
          <tr>
            <th className="px-6 py-4 font-semibold">Candidate</th>
            <th className="px-6 py-4 font-semibold">Details</th>
            <th className="px-6 py-4 font-semibold">Intent</th>
            <th className="px-6 py-4 font-semibold">Score</th>
            <th className="px-6 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0deda] text-[#171717]">
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td className="whitespace-nowrap px-6 py-4 font-medium">
                {candidate.firstName} {candidate.lastName}
              </td>
              <td className="px-6 py-4 text-[#746f70]">
                {[candidate.age, candidate.city, candidate.occupation]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </td>
              <td className="px-6 py-4">{candidate.relationshipIntent || "—"}</td>
              <td className="px-6 py-4">
                {candidate.compatibilityScore ?? "—"}
              </td>
              <td className="px-6 py-4 capitalize">{candidate.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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