import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, FileText, Clock, Save } from "lucide-react";

import {
  getComplaintById,
  updateComplaint,
} from "../../services/complaintService";

import ComplaintsMap from "../../components/ComplaintsMap";

const SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "";

const statuses = [
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

const formatDateTime = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function StaffComplaintDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getComplaintById(id);

        const complaintData = response.complaint;

        setComplaint(complaintData);
        setStatus(complaintData.status);

        setPriority(complaintData.priority || "MEDIUM");

        setResolution(complaintData.resolution || "");
      } catch (error) {
        console.error("Failed to fetch complaint:", error);

        setError(error.response?.data?.message || "Failed to load complaint.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError("");
      setSuccess("");

      const response = await updateComplaint(id, {
        status,
        priority,
        note,
        resolution,
      });

      setComplaint(response.complaint);

      setStatus(response.complaint.status);

      setPriority(response.complaint.priority);

      setResolution(response.complaint.resolution || "");

      setNote("");

      setSuccess("Complaint updated successfully.");
    } catch (error) {
      console.error("Failed to update complaint:", error);

      setError(error.response?.data?.message || "Failed to update complaint.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading complaint...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Complaint not found</h1>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/staff/complaints")}
            className="mt-5 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/staff/complaints")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back to Complaints
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            {complaint.complaintNumber}
          </p>

          <h1 className="mt-1 text-3xl font-bold">{complaint.title}</h1>

          <p className="mt-2 text-sm text-gray-500">
            Submitted on {formatDateTime(complaint.createdAt)}
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Complaint details */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Complaint Details</h2>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm">{complaint.departmentName}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm">{complaint.category}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {complaint.description}
                  </p>
                </div>

                {/* ===== AI INFO ===== */}
                {complaint.aiSummary && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">
                      AI Summary
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {complaint.aiSummary}
                    </p>
                  </div>
                )}

                {complaint.duplicateOf && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    ⚠ This may be a duplicate of another complaint.
                  </p>
                )}
                {/* ===== END AI INFO ===== */}

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Location
                  </p>

                  <div className="mt-2 flex items-start gap-2">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-gray-500"
                    />

                    <p className="text-sm text-gray-700">
                      {complaint.location
                        ? typeof complaint.location === "string"
                          ? complaint.location
                          : [
                              complaint.location.province,
                              complaint.location.district,
                              complaint.location.municipality,
                              complaint.location.ward
                                ? `Ward ${complaint.location.ward}`
                                : "",
                              complaint.location.tole,
                            ]
                              .filter(Boolean)
                              .join(", ")
                        : "N/A"}
                    </p>
                  </div>

                  {/* ===== MAP PIN ===== */}
                  {complaint.coordinates?.lat != null && (
                    <div className="mt-3">
                      <ComplaintsMap complaints={[complaint]} />
                    </div>
                  )}
                  {/* ===== END MAP PIN ===== */}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Attachments</h2>

              {!complaint.attachments || complaint.attachments.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No attachments were submitted.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {complaint.attachments.map((file, index) => (
                    <a
                      key={`${file.name}-${index}`}
                      href={`${SERVER_URL}${file.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <FileText size={22} className="shrink-0" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Update complaint */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Save size={20} />

                <h2 className="text-lg font-semibold">Update Complaint</h2>
              </div>

              <div className="mt-6 space-y-5">
                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    {statuses.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className="text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>

                  <select
                    id="priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    <option value="LOW">LOW</option>

                    <option value="MEDIUM">MEDIUM</option>

                    <option value="HIGH">HIGH</option>

                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label
                    htmlFor="note"
                    className="text-sm font-medium text-gray-700"
                  >
                    Update Note
                  </label>

                  <textarea
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="Describe what happened or what action was taken..."
                    className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    This note will be added to the complaint history.
                  </p>
                </div>

                {/* Resolution */}
                <div>
                  <label
                    htmlFor="resolution"
                    className="text-sm font-medium text-gray-700"
                  >
                    Resolution
                  </label>

                  <textarea
                    id="resolution"
                    value={resolution}
                    onChange={(event) => setResolution(event.target.value)}
                    rows={4}
                    placeholder="Enter the final resolution if applicable..."
                    className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Save */}
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />

                  {isUpdating ? "Updating..." : "Update Complaint"}
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Current status */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Current Status</h2>

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Status
                </p>

                <p className="mt-1 text-lg font-bold">
                  {complaint.status.replaceAll("_", " ")}
                </p>
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock size={18} />

                <h2 className="text-lg font-semibold">Status History</h2>
              </div>

              {complaint.history && complaint.history.length > 0 ? (
                <div className="mt-5 space-y-5">
                  {complaint.history.map((item, index) => (
                    <div
                      key={`${item.changedAt}-${index}`}
                      className="relative border-l-2 border-gray-200 pl-4"
                    >
                      <p className="text-sm font-semibold">
                        {item.status.replaceAll("_", " ")}
                      </p>

                      {item.note && (
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {item.note}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDateTime(item.changedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No status history available.
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Priority
              </p>

              <p className="mt-1 text-xl font-bold">{complaint.priority}</p>
            </div>

            {/* Existing resolution */}
            {complaint.resolution && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Resolution
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {complaint.resolution}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffComplaintDetails;
