"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  candidateId: string;
  currentStatus: string;
};

export default function CandidateActions({
  candidateId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

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

      if (!response.ok) {
        alert("Failed to update candidate.");
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("SHORTLISTED")}
          className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Updating..." : "❤️ Shortlist"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => setShowInterviewForm((value) => !value)}
          className="rounded-xl border border-[#e8d9db] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:opacity-50"
        >
          📅 Schedule Interview
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("REJECTED")}
          className="rounded-xl border border-[#e8d9db] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {showInterviewForm && (
        <div className="rounded-2xl border border-[#e8d9db] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#171717]">
              Schedule Interview
            </h3>

            <p className="mt-1 text-sm text-[#746f70]">
              Pick a time and add the Google Meet details.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">
                Date & time
              </label>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">
                Google Meet link
              </label>

              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">
                Admin notes
              </label>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Things to remember before the interview..."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#e8d9db] bg-[#fff8f5] px-4 py-3 text-sm outline-none focus:border-[#e94f64]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={scheduleInterview}
                className="rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule Interview"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowInterviewForm(false)}
                className="rounded-xl border border-[#e8d9db] px-5 py-3 text-sm font-semibold text-[#171717] hover:bg-[#fff8f5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}