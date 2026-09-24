"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  candidateId: string;
  currentStatus: string;
};

const dateTypes = [
  ["ONLINE", "Online 💻"],
  ["COFFEE", "Coffee ☕"],
  ["DINNER", "Dinner 🍝"],
  ["WALK", "Walk 🚶"],
  ["OTHER", "Other ✨"],
];

const prompts = [
  "Rapid fire questions",
  "Would you rather",
  "Deep questions",
  "Red flag / green flag",
  "Random questions",
];

export default function CandidateActions({
  candidateId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");

  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const [dateType, setDateType] = useState("ONLINE");
  const [datePrompt, setDatePrompt] = useState("");

  // ---------------------------------------
  // STATUS UPDATE
  // ---------------------------------------

  async function updateStatus(status: string) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update candidate.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------
  // INTERVIEW
  // ---------------------------------------

  async function scheduleInterview() {
    if (!scheduledAt) {
      alert("Please select an interview date and time.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledAt,
            meetingUrl,
            adminNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to schedule interview.");
        return;
      }

      setShowInterviewForm(false);
      setScheduledAt("");
      setMeetingUrl("");
      setAdminNotes("");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function completeInterview() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/interview/complete`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to complete interview.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------
  // DATE
  // ---------------------------------------

  async function scheduleDate() {
    if (!scheduledAt) {
      alert("Please select a date and time.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledAt,
            meetingUrl,
            type: dateType,
            prompt: datePrompt,
            privateNotes: adminNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to schedule date.");
        return;
      }

      setShowDateForm(false);
      setScheduledAt("");
      setMeetingUrl("");
      setAdminNotes("");
      setDateType("ONLINE");
      setDatePrompt("");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function completeDate() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/date/complete`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete date.");
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------
  // FINAL DECISION
  // ---------------------------------------

  async function makeFinalDecision(
    decision: "ACCEPTED" | "REJECTED"
  ) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/candidates/${candidateId}/decision`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
            note: decisionNote || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save decision."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------
  // CURRENT PIPELINE STATE
  // ---------------------------------------

  const interviewScheduled =
    currentStatus === "INTERVIEW_SCHEDULED";

  const interviewCompleted =
    currentStatus === "INTERVIEW_COMPLETED";

  const dateScheduled =
    currentStatus === "DATE_SCHEDULED";

  const dateCompleted =
    currentStatus === "DATE_COMPLETED";

  const finalDecisionMade =
    currentStatus === "ACCEPTED" ||
    currentStatus === "REJECTED";

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <div className="space-y-5">

      {/* MAIN ACTIONS */}

      <div className="flex flex-wrap gap-3">

        {/* SHORTLIST */}

        {currentStatus !== "SHORTLISTED" &&
          !interviewScheduled &&
          !interviewCompleted &&
          !dateScheduled &&
          !dateCompleted &&
          !finalDecisionMade && (
            <button
              type="button"
              disabled={loading}
              onClick={() => updateStatus("SHORTLISTED")}
              className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              ❤️ Shortlist
            </button>
          )}

        {/* SCHEDULE INTERVIEW */}

        {!interviewScheduled &&
          !interviewCompleted &&
          !dateScheduled &&
          !dateCompleted &&
          !finalDecisionMade && (
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setShowInterviewForm((value) => !value)
              }
              className="rounded-xl border border-[#e8d9db] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:opacity-50"
            >
              📅 Schedule Interview
            </button>
          )}

        {/* COMPLETE INTERVIEW */}

        {interviewScheduled && (
          <button
            type="button"
            disabled={loading}
            onClick={completeInterview}
            className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "✓ Mark Interview Completed"}
          </button>
        )}

        {/* SCHEDULE DATE */}

        {interviewCompleted && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setShowDateForm((value) => !value)
            }
            className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            💕 Schedule Date
          </button>
        )}

        {/* REJECT */}

        {!dateScheduled &&
          !dateCompleted &&
          !finalDecisionMade && (
            <button
              type="button"
              disabled={loading}
              onClick={() => updateStatus("REJECTED")}
              className="rounded-xl border border-[#e8d9db] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:opacity-50"
            >
              Reject
            </button>
          )}
      </div>

      {/* --------------------------------------- */}
      {/* INTERVIEW FORM */}
      {/* --------------------------------------- */}

      {showInterviewForm && (
        <div className="rounded-2xl border border-[#e8d9db] bg-white p-6 shadow-sm">

          <h3 className="text-lg font-bold text-[#171717]">
            📅 Schedule Interview
          </h3>

          <p className="mt-1 text-sm text-[#746f70]">
            Give the candidate a time and a place to
            prove themselves.
          </p>

          <div className="mt-5 space-y-4">

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Date & time
              </label>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) =>
                  setScheduledAt(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Google Meet link
              </label>

              <input
                type="url"
                value={meetingUrl}
                onChange={(e) =>
                  setMeetingUrl(e.target.value)
                }
                placeholder="https://meet.google.com/..."
                className="mt-2 w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Admin notes
              </label>

              <textarea
                value={adminNotes}
                onChange={(e) =>
                  setAdminNotes(e.target.value)
                }
                rows={3}
                placeholder="Things to remember..."
                className="mt-2 w-full resize-none rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                disabled={loading}
                onClick={scheduleInterview}
                className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading
                  ? "Scheduling..."
                  : "Schedule Interview"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowInterviewForm(false)
                }
                className="rounded-xl border border-[#e8d9db] px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------- */}
      {/* DATE FORM */}
      {/* --------------------------------------- */}

      {showDateForm && (
        <div className="rounded-2xl border border-[#f8dde2] bg-white p-6 shadow-sm">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#e94f64]">
              Next stage
            </p>

            <h3 className="mt-1 text-xl font-bold text-[#171717]">
              💕 Schedule the Date
            </h3>

            <p className="mt-1 text-sm text-[#746f70]">
              The interview went well. Now comes the fun
              part.
            </p>
          </div>

          <div className="mt-5 space-y-5">

            {/* DATE + TIME */}

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Date & time
              </label>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) =>
                  setScheduledAt(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            {/* DATE TYPE */}

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Date type
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">

                {dateTypes.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDateType(value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      dateType === value
                        ? "border-[#e94f64] bg-[#f8dde2] text-[#e94f64]"
                        : "border-[#e8d9db] bg-white text-[#171717]"
                    }`}
                  >
                    {label}
                  </button>
                ))}

              </div>
            </div>

            {/* MEETING */}

            {dateType === "ONLINE" && (
              <div>
                <label className="text-sm font-semibold text-[#171717]">
                  Meeting link
                </label>

                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) =>
                    setMeetingUrl(e.target.value)
                  }
                  placeholder="https://meet.google.com/..."
                  className="mt-2 w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
                />
              </div>
            )}

            {/* PROMPT */}

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Date prompt
              </label>

              <div className="mt-3 flex flex-wrap gap-2">

                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDatePrompt(prompt)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      datePrompt === prompt
                        ? "border-[#e94f64] bg-[#f8dde2] text-[#e94f64]"
                        : "border-[#e8d9db] bg-white text-[#171717]"
                    }`}
                  >
                    {prompt}
                  </button>
                ))}

              </div>
            </div>

            {/* PRIVATE NOTES */}

            <div>
              <label className="text-sm font-semibold text-[#171717]">
                Private notes
              </label>

              <textarea
                value={adminNotes}
                onChange={(e) =>
                  setAdminNotes(e.target.value)
                }
                rows={3}
                placeholder="Internal notes about the date..."
                className="mt-2 w-full resize-none rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                disabled={loading}
                onClick={scheduleDate}
                className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? "Scheduling..."
                  : "💕 Schedule Date"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setShowDateForm(false)
                }
                className="rounded-xl border border-[#e8d9db] px-5 py-3 text-sm font-semibold text-[#171717] hover:bg-[#fff8f5]"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------- */}
      {/* DATE COMPLETED */}
      {/* --------------------------------------- */}

      {currentStatus === "DATE_SCHEDULED" && (
        <div className="rounded-2xl border border-[#e8d9db] bg-white p-5">

          <div className="mb-4">

            <p className="text-sm font-semibold text-[#e94f64]">
              💌 Date completed?
            </p>

            <h3 className="mt-1 text-xl font-semibold text-[#171717]">
              So... how did that go?
            </h3>

            <p className="mt-1 text-sm text-[#746f70]">
              Mark the date as completed once you are ready
              to make the final decision.
            </p>

          </div>

          <button
            type="button"
            onClick={completeDate}
            disabled={loading}
            className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "✓ Mark Date Completed"}
          </button>

        </div>
      )}

      {/* --------------------------------------- */}
      {/* FINAL DECISION */}
      {/* --------------------------------------- */}

      {currentStatus === "DATE_COMPLETED" && (
        <div className="rounded-2xl border border-[#e8d9db] bg-white p-5">

          <div className="mb-5">

            <p className="text-sm font-semibold text-[#e94f64]">
              📝 Final decision
            </p>

            <h3 className="mt-1 text-xl font-semibold text-[#171717]">
              The moment of truth.
            </h3>

            <p className="mt-1 text-sm text-[#746f70]">
              The date is done. Time to make the final
              recruitment decision.
            </p>

          </div>

          <textarea
            value={decisionNote}
            onChange={(e) =>
              setDecisionNote(e.target.value)
            }
            placeholder="Optional final notes..."
            className="mb-4 min-h-[100px] w-full rounded-xl border border-[#e8d9db] p-3 text-sm outline-none focus:border-[#e94f64]"
          />

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                makeFinalDecision("ACCEPTED")
              }
              disabled={loading}
              className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              💖 Hire this boyfriend
            </button>

            <button
              type="button"
              onClick={() =>
                makeFinalDecision("REJECTED")
              }
              disabled={loading}
              className="rounded-xl border border-[#e8d9db] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:opacity-50"
            >
              🫡 Close application
            </button>

          </div>
        </div>
      )}

    </div>
  );
}