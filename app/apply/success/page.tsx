"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="min-h-screen bg-[#fdf1f3] px-5 py-16 text-[#2a1626]">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-8 text-center shadow-[0_12px_40px_-20px_rgb(217_54_79/0.35)] md:p-12">
          <div className="text-6xl" aria-hidden="true">
            💌
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#d9364f]">
            Application received
          </p>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight md:text-5xl">
            You're officially in the pipeline.
          </h1>

          <p className="mx-auto mt-5 max-w-lg leading-7 text-[#6b5566]">
            Your boyfriend application has been successfully submitted.
            The recruitment committee will now begin its extremely serious
            evaluation process.
          </p>

          {id && (
            <p className="mt-6 rounded-2xl bg-[#fdf1f3] px-5 py-3 text-sm text-[#6b5566]">
              Application ID{" "}
              <span className="font-bold text-[#2a1626]">
                #{id.slice(-6).toUpperCase()}
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {id && (
              <Link
                href={`/candidate/${id}`}
                className="rounded-xl bg-[#2a1626] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                View my profile →
              </Link>
            )}

            <Link
              href="/"
              className="rounded-xl border border-[#2a1626]/15 bg-white px-6 py-3 text-sm font-semibold text-[#2a1626] transition hover:border-[#d9364f] hover:bg-[#fff1f3]"
            >
              Back to portal
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fdf1f3] text-[#2a1626]">
          <p className="text-sm text-[#6b5566]">
            Loading your application...
          </p>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}