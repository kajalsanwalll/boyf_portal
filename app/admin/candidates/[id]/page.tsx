type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidatePage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#fff8f5] p-10">
      <h1 className="text-4xl font-bold text-[#171717]">
        Candidate Review
      </h1>

      <p className="mt-4 text-[#746f70]">
        Candidate ID: {id}
      </p>
    </main>
  );
}