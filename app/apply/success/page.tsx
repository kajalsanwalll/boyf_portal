"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-3xl border border-[#e8d9db] bg-white p-8 text-center shadow-sm md:p-12">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f8dde2] text-4xl">
            💘
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#e94f64]">
            Application received
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717]">
            You're officially in the pipeline.
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-[#746f70]">
            Your application has been submitted to the boyfriend
            recruitment department. Our highly qualified team of
            questionable decision-makers will review it shortly.
          </p>

          {id && (
            <div className="mt-7 rounded-2xl bg-[#fff8f5] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                Candidate ID
              </p>

              <p className="mt-2 break-all font-mono text-sm font-bold text-[#171717]">
                {id}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {id && (
              <Link
                href={`/candidate/${id}`}
                className="rounded-xl bg-[#e94f64] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                View application status →
              </Link>
            )}

            <Link
              href="/"
              className="rounded-xl border border-[#e8d9db] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5]"
            >
              Back home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#746f70]">
          Please do not refresh your personality while we process
          your application.
        </p>
      </div>
    </main>
  );
}