"use client";

import { useMemo, useState } from "react";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string | null;
  age: number;
  city: string;
  occupation: string | null;
  relationshipIntent: string | null;
  compatibilityScore: number | null;
  status: string;
  createdAt: Date;
};

type Props = {
  candidates: Candidate[];
};

const PAGE_SIZE = 25;

export default function CandidatesTable({
  candidates,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [page, setPage] = useState(1);

  const cities = useMemo(() => {
    return [...new Set(candidates.map((c) => c.city))].sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchMatch =
        `${candidate.firstName} ${candidate.lastName ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        candidate.city
          .toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        status === "ALL" || candidate.status === status;

      const cityMatch =
        city === "ALL" || candidate.city === city;

      return searchMatch && statusMatch && cityMatch;
    });
  }, [candidates, search, status, city]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / PAGE_SIZE)
  );

  const visibleCandidates = filteredCandidates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const allVisibleSelected =
    visibleCandidates.length > 0 &&
    visibleCandidates.every((candidate) =>
      selected.includes(candidate.id)
    );

  function toggleCandidate(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    if (allVisibleSelected) {
      setSelected((current) =>
        current.filter(
          (id) =>
            !visibleCandidates.some(
              (candidate) => candidate.id === id
            )
        )
      );
    } else {
      setSelected((current) => [
        ...new Set([
          ...current,
          ...visibleCandidates.map(
            (candidate) => candidate.id
          ),
        ]),
      ]);
    }
  }

  async function bulkUpdate(newStatus: string) {
    if (!selected.length) return;

    const response = await fetch(
      "/api/admin/candidates/bulk",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateIds: selected,
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      alert("Something went wrong.");
      return;
    }

    window.location.reload();
  }

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat
          label="Total Applicants"
          value={candidates.length}
        />

        <Stat
          label="Shortlisted"
          value={
            candidates.filter(
              (c) => c.status === "SHORTLISTED"
            ).length
          }
        />

        <Stat
          label="Interviews"
          value={
            candidates.filter(
              (c) =>
                c.status === "INTERVIEW_SCHEDULED" ||
                c.status === "INTERVIEW_COMPLETED"
            ).length
          }
        />

        <Stat
          label="Avg. Compatibility"
          value={`${Math.round(
            candidates.reduce(
              (sum, c) =>
                sum + (c.compatibilityScore ?? 0),
              0
            ) / candidates.length
          )}%`}
        />
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-2xl border border-[#e8d9db] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or city..."
            className="flex-1 rounded-xl border border-[#e8d9db] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#e8d9db] bg-white px-4 py-3 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">
              Interview Scheduled
            </option>
            <option value="INTERVIEW_COMPLETED">
              Interview Completed
            </option>
            <option value="DATE_SCHEDULED">
              Date Scheduled
            </option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#e8d9db] bg-white px-4 py-3 text-sm"
          >
            <option value="ALL">All cities</option>

            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#171717] px-5 py-4 text-white">
          <span className="text-sm">
            {selected.length} candidate
            {selected.length !== 1 ? "s" : ""} selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={() =>
                bulkUpdate("SHORTLISTED")
              }
              className="rounded-lg bg-[#e94f64] px-4 py-2 text-sm font-medium"
            >
              Shortlist
            </button>

            <button
              onClick={() =>
                bulkUpdate("REJECTED")
              }
              className="rounded-lg border border-white/20 px-4 py-2 text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8d9db] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e8d9db] bg-[#fff8f5]">
              <tr>
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                  />
                </th>

                <th className="px-5 py-4 font-medium">
                  Candidate
                </th>

                <th className="px-5 py-4 font-medium">
                  City
                </th>

                <th className="px-5 py-4 font-medium">
                  Intent
                </th>

                <th className="px-5 py-4 font-medium">
                  Compatibility
                </th>

                <th className="px-5 py-4 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-b border-[#f0e5e6] transition hover:bg-[#fff8f5]"
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        candidate.id
                      )}
                      onChange={() =>
                        toggleCandidate(candidate.id)
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#171717]">
                        {candidate.firstName}{" "}
                        {candidate.lastName}
                      </p>

                      <p className="text-xs text-[#746f70]">
                        {candidate.age} ·{" "}
                        {candidate.occupation}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {candidate.city}
                  </td>

                  <td className="px-5 py-4">
                    {formatValue(
                      candidate.relationshipIntent
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold">
                      {candidate.compatibilityScore ?? "—"}%
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={candidate.status}
                    />
                  </td>
                </tr>
              ))}

              {visibleCandidates.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-[#746f70]"
                  >
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#e8d9db] px-5 py-4">
          <p className="text-sm text-[#746f70]">
            Showing{" "}
            {filteredCandidates.length === 0
              ? 0
              : (page - 1) * PAGE_SIZE + 1}
            –
            {Math.min(
              page * PAGE_SIZE,
              filteredCandidates.length
            )}{" "}
            of {filteredCandidates.length}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="rounded-lg border border-[#e8d9db] px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              className="rounded-lg border border-[#e8d9db] px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-[#e8d9db] bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-[#746f70]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#171717]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-[#f8dde2] px-3 py-1 text-xs font-medium text-[#171717]">
      {formatValue(status)}
    </span>
  );
}

function formatValue(value: string | null) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}