import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getComplaintById,
  assignComplaint,
  updateComplaintPriority,
} from "../../services/complaintService";

import { getStaffByDepartment } from "../../services/userService";

const SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "";

const formatDateTime = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";

    case "HIGH":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "LOW":
      return "bg-green-100 text-green-700 border-green-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assignment state
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // Priority state
  const [selectedPriority, setSelectedPriority] =
    useState("MEDIUM");

  const [updatingPriority, setUpdatingPriority] =
    useState(false);

  const [priorityError, setPriorityError] =
    useState("");

  const [prioritySuccess, setPrioritySuccess] =
    useState("");

  const loadComplaint = async () => {
    const complaintResponse =
      await getComplaintById(id);

    const loadedComplaint =
      complaintResponse.complaint;

    setComplaint(loadedComplaint);

    setSelectedPriority(
      loadedComplaint.priority || "MEDIUM"
    );

    return loadedComplaint;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load complaint
        const loadedComplaint =
          await loadComplaint();

        // Load staff for the complaint's department
        try {
          const staffResponse =
            await getStaffByDepartment(
              loadedComplaint.departmentId
            );

          setStaffMembers(
            staffResponse.staff || []
          );
        } catch (staffError) {
          console.error(
            "Failed to load department staff:",
            staffError
          );

          setStaffMembers([]);
        }

        // Set currently assigned staff
        if (loadedComplaint.assignedTo) {
          setSelectedStaff(
            loadedComplaint.assignedTo.toString()
          );
        }
      } catch (error) {
        console.error(
          "Failed to load complaint:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load complaint."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedStaff) {
      setAssignError(
        "Please select a staff member."
      );
      return;
    }

    // Frontend protection
    if (complaint.status === "DUPLICATE") {
      setAssignError(
        "Duplicate complaints cannot be assigned to staff."
      );
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      setAssignSuccess("");

      const response = await assignComplaint(
        id,
        selectedStaff
      );

      setComplaint(response.complaint);

      setAssignSuccess(
        "Complaint assigned successfully."
      );
    } catch (error) {
      console.error(error);

      setAssignError(
        error.response?.data?.message ||
          "Failed to assign complaint."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handlePriorityUpdate = async () => {
    if (!selectedPriority) {
      setPriorityError(
        "Please select a priority."
      );
      return;
    }

    if (
      selectedPriority ===
      (complaint.priority || "MEDIUM")
    ) {
      setPriorityError(
        "Please select a different priority to make an override."
      );
      return;
    }

    try {
      setUpdatingPriority(true);
      setPriorityError("");
      setPrioritySuccess("");

      const response =
        await updateComplaintPriority(
          id,
          selectedPriority
        );

      setComplaint(response.complaint);

      setSelectedPriority(
        response.complaint.priority
      );

      setPrioritySuccess(
        "Complaint priority updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update priority:",
        error
      );

      setPriorityError(
        error.response?.data?.message ||
          "Failed to update complaint priority."
      );
    } finally {
      setUpdatingPriority(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-500">
            Loading complaint...
          </p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 rounded-md border px-4 py-2"
          >
            ← Back
          </button>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-red-500">
              {error || "Complaint not found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const aiPriority =
    complaint.aiPriority ||
    complaint.priority ||
    "MEDIUM";

  const currentPriority =
    complaint.priority || "MEDIUM";

  const aiScore =
    typeof complaint.aiPriorityScore === "number"
      ? complaint.aiPriorityScore
      : null;

  const prioritySource =
    complaint.prioritySource || "AI";

  const priorityWasChanged =
    aiPriority !== currentPriority;

  const isAdminOverride =
    prioritySource === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Complaint Details
          </h1>

          <p className="mt-2 text-gray-500">
            Complaint #{complaint.complaintNumber}
          </p>
        </div>

        <div className="space-y-6">

          {/* Complaint Information */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Complaint Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <p className="text-sm text-gray-500">
                  Complaint Number
                </p>

                <p className="mt-1 font-medium">
                  {complaint.complaintNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Submitted
                </p>

                <p className="mt-1 font-medium">
                  {formatDateTime(
                    complaint.createdAt
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Department
                </p>

                <p className="mt-1 font-medium">
                  {complaint.departmentName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-medium">
                  {complaint.category}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Location
                </p>

                <p className="mt-1 font-medium">
                  {typeof complaint.location ===
                  "object"
                    ? [
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
                    : complaint.location}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Current Priority
                </p>

                <span
                  className={`mt-1 inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getPriorityClasses(
                    currentPriority
                  )}`}
                >
                  {currentPriority}
                </span>

                <p className="mt-2 text-xs text-gray-500">
                  Source:{" "}
                  {isAdminOverride
                    ? "Admin Override"
                    : "AI Recommendation"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Title
              </p>

              <p className="mt-1 text-lg font-semibold">
                {complaint.title}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* AI Priority Recommendation */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Priority Recommendation
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  The AI system analyzed the complaint
                  and recommended the following priority.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                AI Recommendation
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* AI Priority */}
              <div className="rounded-lg bg-white p-5">
                <p className="text-sm text-gray-500">
                  Recommended Priority
                </p>

                <span
                  className={`mt-2 inline-block rounded-full border px-4 py-2 text-sm font-bold ${getPriorityClasses(
                    aiPriority
                  )}`}
                >
                  {aiPriority}
                </span>
              </div>

              {/* AI Score */}
              <div className="rounded-lg bg-white p-5">
                <p className="text-sm text-gray-500">
                  AI Priority Score
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {aiScore !== null
                    ? aiScore
                    : "Not available"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Higher scores indicate greater urgency.
                </p>
              </div>
            </div>

            {/* Comparison */}
            <div className="mt-4 rounded-lg bg-white p-5">
              <p className="text-sm text-gray-500">
                Priority Review
              </p>

              {priorityWasChanged ? (
                <div className="mt-2">
                  <p className="font-medium text-orange-700">
                    Current priority differs from the
                    original AI recommendation.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`rounded-full border px-3 py-1 font-semibold ${getPriorityClasses(
                        aiPriority
                      )}`}
                    >
                      AI: {aiPriority}
                    </span>

                    <span className="text-gray-400">
                      →
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 font-semibold ${getPriorityClasses(
                        currentPriority
                      )}`}
                    >
                      Current: {currentPriority}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 font-medium text-green-700">
                  Current priority matches the AI
                  recommendation.
                </p>
              )}
            </div>
          </div>

          {/* Admin Priority Override */}
          <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Admin Priority Override
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  An administrator can manually change
                  the AI-recommended priority when needed.
                </p>
              </div>

              {isAdminOverride && (
                <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Admin Override
                </span>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Complaint Priority
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  id="priority"
                  value={selectedPriority}
                  onChange={(event) => {
                    setSelectedPriority(
                      event.target.value
                    );
                    setPriorityError("");
                    setPrioritySuccess("");
                  }}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm md:max-w-md"
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="CRITICAL">
                    CRITICAL
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handlePriorityUpdate}
                  disabled={
                    updatingPriority ||
                    selectedPriority ===
                      currentPriority
                  }
                  className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingPriority
                    ? "Updating..."
                    : "Update Priority"}
                </button>
              </div>

              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">
                      AI Recommended:
                    </span>

                    <span
                      className={`ml-2 inline-block rounded-full border px-2 py-1 text-xs font-semibold ${getPriorityClasses(
                        aiPriority
                      )}`}
                    >
                      {aiPriority}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Current:
                    </span>

                    <span
                      className={`ml-2 inline-block rounded-full border px-2 py-1 text-xs font-semibold ${getPriorityClasses(
                        currentPriority
                      )}`}
                    >
                      {currentPriority}
                    </span>
                  </div>
                </div>
              </div>

              {priorityError && (
                <p className="mt-3 text-sm text-red-600">
                  {priorityError}
                </p>
              )}

              {prioritySuccess && (
                <p className="mt-3 text-sm text-green-600">
                  {prioritySuccess}
                </p>
              )}

              {isAdminOverride && (
                <p className="mt-3 text-xs text-orange-600">
                  This complaint's current priority was
                  manually overridden by an administrator.
                  The original AI recommendation remains
                  unchanged.
                </p>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Assign Complaint
            </h2>

            <p className="mb-4 text-sm text-gray-500">
              Assign this complaint to a staff member
              from the same department.
            </p>

            {complaint.status === "DUPLICATE" ? (
              <div className="rounded-md bg-gray-50 p-4">
                <p className="font-medium text-gray-700">
                  This complaint cannot be assigned.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Duplicate complaints do not require
                  staff assignment.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row">
                  <select
                    value={selectedStaff}
                    onChange={(event) => {
                      setSelectedStaff(
                        event.target.value
                      );
                      setAssignError("");
                      setAssignSuccess("");
                    }}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm md:flex-1"
                  >
                    <option value="">
                      Select staff member
                    </option>

                    {staffMembers.map((staff) => (
                      <option
                        key={staff._id}
                        value={staff._id}
                      >
                        {staff.name}
                        {staff.employeeId
                          ? ` (${staff.employeeId})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={
                      assigning ||
                      staffMembers.length === 0
                    }
                    className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning
                      ? "Assigning..."
                      : "Assign"}
                  </button>
                </div>

                {staffMembers.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    No staff members are available in
                    this department.
                  </p>
                )}

                {assignError && (
                  <p className="mt-3 text-sm text-red-600">
                    {assignError}
                  </p>
                )}

                {assignSuccess && (
                  <p className="mt-3 text-sm text-green-600">
                    {assignSuccess}
                  </p>
                )}

                {complaint.assignedTo && (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-sm text-gray-500">
                      Currently Assigned
                    </p>

                    <p className="mt-1 font-medium">
                      {staffMembers.find(
                        (staff) =>
                          staff._id.toString() ===
                          complaint.assignedTo.toString()
                      )?.name ||
                        "Assigned staff member"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Current Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Current Status
            </h2>

            <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
              {complaint.status}
            </span>

            {complaint.status === "DUPLICATE" &&
              complaint.duplicateOf && (
                <div className="mt-4 rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Original Complaint
                  </p>

                  <p className="mt-1 font-medium">
                    {complaint.duplicateOf.complaintNumber ||
                      complaint.duplicateOf}
                  </p>

                  {complaint.duplicateOf.title && (
                    <p className="mt-1 text-sm text-gray-600">
                      {complaint.duplicateOf.title}
                    </p>
                  )}
                </div>
              )}
          </div>

          {/* Status History */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Status History
            </h2>

            {complaint.history &&
            complaint.history.length > 0 ? (
              <div className="space-y-4">
                {complaint.history.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <p className="font-semibold">
                        {item.status}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDateTime(
                          item.changedAt
                        )}
                      </p>

                      {item.note && (
                        <p className="mt-2 text-sm text-gray-700">
                          {item.note}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No status history available.
              </p>
            )}
          </div>

          {/* Resolution */}
          {complaint.resolution && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">
                Resolution
              </h2>

              <p className="whitespace-pre-wrap text-gray-700">
                {complaint.resolution}
              </p>
            </div>
          )}

          {/* Attachments */}
          {complaint.attachments &&
            complaint.attachments.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                  Attachments
                </h2>

                <div className="space-y-2">
                  {complaint.attachments.map(
                    (attachment, index) => (
                      <a
                        key={index}
                        href={`${SERVER_URL}${attachment.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md border p-3 text-blue-600 hover:bg-gray-50"
                      >
                        {attachment.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default AdminComplaintDetails;