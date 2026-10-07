import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDuplicateComplaints,
  markComplaintAsDuplicate,
} from "../../services/complaintService";

const formatDateTime = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function AdminDuplicateComplaints() {
  const navigate = useNavigate();

  const [possibleDuplicates, setPossibleDuplicates] =
    useState([]);

  const [confirmedDuplicates, setConfirmedDuplicates] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [originalComplaintId, setOriginalComplaintId] =
    useState("");

  const [duplicateNote, setDuplicateNote] =
    useState("");

  const [markingDuplicate, setMarkingDuplicate] =
    useState(false);

  const [duplicateError, setDuplicateError] =
    useState("");

  const [duplicateSuccess, setDuplicateSuccess] =
    useState("");

  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDuplicateComplaints();

      setPossibleDuplicates(
        response.possibleDuplicates || []
      );

      setConfirmedDuplicates(
        response.confirmedDuplicates || []
      );
    } catch (error) {
      console.error(
        "Failed to load duplicate complaints:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load duplicate complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const openMarkDuplicate = (complaint) => {
    setSelectedComplaint(complaint);
    setOriginalComplaintId(
      complaint.duplicateOf?._id ||
        complaint.duplicateOf ||
        ""
    );
    setDuplicateNote("");
    setDuplicateError("");
    setDuplicateSuccess("");
  };

  const closeMarkDuplicate = () => {
    if (markingDuplicate) {
      return;
    }

    setSelectedComplaint(null);
    setOriginalComplaintId("");
    setDuplicateNote("");
    setDuplicateError("");
    setDuplicateSuccess("");
  };

  const handleMarkAsDuplicate = async () => {
    if (!selectedComplaint) {
      return;
    }

    if (!originalComplaintId.trim()) {
      setDuplicateError(
        "Please enter the original complaint ID."
      );
      return;
    }

    if (
      originalComplaintId.trim() ===
      selectedComplaint._id
    ) {
      setDuplicateError(
        "A complaint cannot be marked as a duplicate of itself."
      );
      return;
    }

    try {
      setMarkingDuplicate(true);
      setDuplicateError("");
      setDuplicateSuccess("");

      await markComplaintAsDuplicate(
        selectedComplaint._id,
        originalComplaintId.trim(),
        duplicateNote.trim()
      );

      setDuplicateSuccess(
        "Complaint marked as duplicate successfully."
      );

      await fetchDuplicates();

      setTimeout(() => {
        closeMarkDuplicate();
      }, 800);
    } catch (error) {
      console.error(
        "Failed to mark complaint as duplicate:",
        error
      );

      setDuplicateError(
        error.response?.data?.message ||
          "Failed to mark complaint as duplicate."
      );
    } finally {
      setMarkingDuplicate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-500">
            Loading duplicate complaints...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Duplicate Complaints
            </h1>

            <p className="mt-2 text-gray-500">
              Review complaints identified by the AI as
              possible duplicates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Possible Duplicates */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">
              Possible Duplicates
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              These complaints were identified by the AI
              as potential duplicates. An admin must
              confirm them before they become DUPLICATE.
            </p>
          </div>

          {possibleDuplicates.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No possible duplicate complaints found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {possibleDuplicates.map((complaint) => (
                <div
                  key={complaint._id}
                  className="rounded-lg bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* Complaint Information */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {complaint.complaintNumber}
                        </h3>

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          POSSIBLE DUPLICATE
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-medium">
                        {complaint.title}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <div>
                          <p className="text-gray-500">
                            Department
                          </p>

                          <p className="mt-1 font-medium">
                            {complaint.departmentName ||
                              "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Category
                          </p>

                          <p className="mt-1 font-medium">
                            {complaint.category ||
                              "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Submitted
                          </p>

                          <p className="mt-1 font-medium">
                            {formatDateTime(
                              complaint.createdAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Status
                          </p>

                          <p className="mt-1 font-medium">
                            {complaint.status}
                          </p>
                        </div>
                      </div>

                      {/* AI Suggested Original */}
                      {complaint.duplicateOf && (
                        <div className="mt-5 rounded-md bg-yellow-50 p-4">
                          <p className="text-sm text-gray-500">
                            AI Suggested Original Complaint
                          </p>

                          <p className="mt-1 font-medium">
                            {complaint.duplicateOf
                              .complaintNumber ||
                              complaint.duplicateOf}
                          </p>

                          {complaint.duplicateOf
                            .title && (
                            <p className="mt-1 text-sm text-gray-600">
                              {
                                complaint.duplicateOf
                                  .title
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/complaints/${complaint._id}`
                          )
                        }
                        className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        View Complaint
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openMarkDuplicate(
                            complaint
                          )
                        }
                        className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Mark as Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Duplicates */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">
              Confirmed Duplicates
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complaints that have already been confirmed
              as duplicates by an administrator.
            </p>
          </div>

          {confirmedDuplicates.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No confirmed duplicate complaints.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedDuplicates.map(
                (complaint) => (
                  <div
                    key={complaint._id}
                    className="rounded-lg bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {complaint.complaintNumber}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            DUPLICATE
                          </span>
                        </div>

                        <p className="mt-3 text-lg font-medium">
                          {complaint.title}
                        </p>

                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <div>
                            <p className="text-gray-500">
                              Department
                            </p>

                            <p className="mt-1 font-medium">
                              {complaint.departmentName ||
                                "Not available"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Category
                            </p>

                            <p className="mt-1 font-medium">
                              {complaint.category ||
                                "Not available"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-md bg-gray-50 p-4">
                          <p className="text-sm text-gray-500">
                            Original Complaint
                          </p>

                          {complaint.duplicateOf ? (
                            <>
                              <p className="mt-1 font-medium">
                                {complaint.duplicateOf
                                  .complaintNumber ||
                                  complaint.duplicateOf}
                              </p>

                              {complaint
                                .duplicateOf
                                .title && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {
                                    complaint
                                      .duplicateOf
                                      .title
                                  }
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500">
                              Original complaint
                              information unavailable.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/complaints/${complaint._id}`
                            )
                          }
                          className="w-full rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 md:w-auto"
                        >
                          View Complaint
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mark Duplicate Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Confirm Duplicate
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedComplaint.complaintNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeMarkDuplicate}
                disabled={markingDuplicate}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                Complaint
              </p>

              <p className="mt-1 font-medium">
                {selectedComplaint.title}
              </p>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">
                Original Complaint ID
              </label>

              <input
                type="text"
                value={originalComplaintId}
                onChange={(event) => {
                  setOriginalComplaintId(
                    event.target.value
                  );
                  setDuplicateError("");
                  setDuplicateSuccess("");
                }}
                placeholder="Enter original complaint ID"
                disabled={markingDuplicate}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Note
              </label>

              <textarea
                value={duplicateNote}
                onChange={(event) =>
                  setDuplicateNote(
                    event.target.value
                  )
                }
                placeholder="Optional note"
                rows={3}
                disabled={markingDuplicate}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            {duplicateError && (
              <p className="mt-3 text-sm text-red-600">
                {duplicateError}
              </p>
            )}

            {duplicateSuccess && (
              <p className="mt-3 text-sm text-green-600">
                {duplicateSuccess}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeMarkDuplicate}
                disabled={markingDuplicate}
                className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleMarkAsDuplicate}
                disabled={markingDuplicate}
                className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingDuplicate
                  ? "Marking..."
                  : "Confirm Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDuplicateComplaints;