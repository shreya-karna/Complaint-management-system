import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Clock,
  UserCheck,
  LoaderCircle,
  CheckCircle,
  Lock,
  XCircle,
  RotateCcw,
  Copy,
  ArrowRight,
  Users,
  Building2,
  Tags,
  LogOut,
} from "lucide-react";

import { getComplaints } from "../../services/complaintService";
import { getAllFeedback } from "../../services/feedbackService";

import ComplaintsMap from "../../components/ComplaintsMap";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const [complaints, setComplaints] = useState([]);

  const [statistics, setStatistics] = useState(null);

  const [feedback, setFeedback] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch complaints
        const response = await getComplaints();

        setComplaints(response.complaints || []);

        setStatistics(response.statistics || null);

        // Fetch citizen feedback
        const feedbackResponse = await getAllFeedback();

        setFeedback(feedbackResponse.feedback || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        setError(
          error.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalComplaints = statistics?.total || 0;

  const submittedCount = statistics?.submitted || 0;

  const underReviewCount = statistics?.underReview || 0;

  const assignedCount = statistics?.assigned || 0;

  const inProgressCount = statistics?.inProgress || 0;

  const resolvedCount = statistics?.resolved || 0;

  const closedCount = statistics?.closed || 0;

  const rejectedCount = statistics?.rejected || 0;

  const reopenedCount = statistics?.reopened || 0;

  const duplicateCount = statistics?.duplicate || 0;

  const goToComplaints = (status) => {
    if (status) {
      navigate(`/admin/complaints?status=${status}`);

      return;
    }

    navigate("/admin/complaints");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-600" />

          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-gray-500">Complaint Management System</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total */}
          <button
            type="button"
            onClick={() => goToComplaints()}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Complaints
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalComplaints}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
              View all complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Submitted */}
          <button
            type="button"
            onClick={() => goToComplaints("SUBMITTED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {submittedCount}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
              View submitted complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Under Review */}
          <button
            type="button"
            onClick={() => goToComplaints("UNDER_REVIEW")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-yellow-300 hover:bg-yellow-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Under Review
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {underReviewCount}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-yellow-600">
              View complaints under review
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Assigned */}
          <button
            type="button"
            onClick={() => goToComplaints("ASSIGNED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {assignedCount}
                </p>
              </div>

              <div className="rounded-lg bg-purple-100 p-3">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-purple-600">
              View assigned complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => goToComplaints("IN_PROGRESS")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {inProgressCount}
                </p>
              </div>

              <div className="rounded-lg bg-orange-100 p-3">
                <LoaderCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-orange-600">
              View in-progress complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Resolved */}
          <button
            type="button"
            onClick={() => goToComplaints("RESOLVED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {resolvedCount}
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
              View resolved complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Closed */}
          <button
            type="button"
            onClick={() => goToComplaints("CLOSED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Closed</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {closedCount}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3">
                <Lock className="h-6 w-6 text-gray-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600">
              View closed complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Rejected */}
          <button
            type="button"
            onClick={() => goToComplaints("REJECTED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {rejectedCount}
                </p>
              </div>

              <div className="rounded-lg bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600">
              View rejected complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Reopened */}
          <button
            type="button"
            onClick={() => goToComplaints("REOPENED")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Reopened</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {reopenedCount}
                </p>
              </div>

              <div className="rounded-lg bg-pink-100 p-3">
                <RotateCcw className="h-6 w-6 text-pink-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-pink-600">
              View reopened complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => navigate("/admin/complaints/duplicates")}
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Duplicate</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {duplicateCount}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3">
                <Copy className="h-6 w-6 text-gray-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600">
              Manage duplicate complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access common administration tasks.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* View Complaints */}
            <button
              type="button"
              onClick={() => navigate("/admin/complaints")}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">View Complaints</p>

                <p className="text-xs text-gray-500">Manage complaints</p>
              </div>
            </button>

            {/* Users */}
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">Manage Users</p>

                <p className="text-xs text-gray-500">Manage system users</p>
              </div>
            </button>

            {/* Departments */}
            <button
              type="button"
              onClick={() => navigate("/admin/departments")}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="rounded-lg bg-green-100 p-2">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">Manage Departments</p>

                <p className="text-xs text-gray-500">Manage departments</p>
              </div>
            </button>

            {/* Categories */}
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50"
            >
              <div className="rounded-lg bg-orange-100 p-2">
                <Tags className="h-5 w-5 text-orange-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">Manage Categories</p>

                <p className="text-xs text-gray-500">
                  Manage complaint categories
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Complaint Map */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Complaint Map
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View all complaints based on their reported locations.
            </p>
          </div>

          <div className="mt-5">
            <ComplaintsMap complaints={complaints} />
          </div>
        </div>

        {/* Citizen Feedback */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Citizen Feedback
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View feedback submitted by citizens for resolved complaints.
            </p>
          </div>

          {feedback.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500">
                No feedback has been submitted yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {feedback.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Complaint information */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-600">
                        {item.complaintId?.complaintNumber || "Complaint"}
                      </p>

                      <h3 className="mt-1 font-medium text-gray-900">
                        {item.complaintId?.title ||
                          "Complaint title unavailable"}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Department: {item.complaintId?.departmentName || "N/A"}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="shrink-0">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= item.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.rating}/5
                      </p>
                    </div>
                  </div>

                  {/* Citizen comment */}
                  {item.comment && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Citizen Comment
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-700">
                        {item.comment}
                      </p>
                    </div>
                  )}

                  {/* Citizen */}
                  <div className="mt-4 text-xs text-gray-500">
                    Submitted by:{" "}
                    <span className="font-medium text-gray-700">
                      {item.citizenId?.name ||
                        item.citizenId?.email ||
                        "Citizen"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
