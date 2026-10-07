import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  Inbox,
  Layers,
  RotateCcw,
  Tags,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

import { getComplaints } from "../../services/complaintService";

function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getComplaints();

        setComplaints(response.complaints || []);
        setStatistics(response.statistics || null);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const stats = [
    {
      label: "Total Complaints",
      value: statistics?.total || 0,
      icon: Inbox,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-600/10 dark:bg-blue-500/15",
      onClick: () => goToComplaints(),
    },
    {
      label: "Submitted",
      value: statistics?.submitted || 0,
      icon: FileText,
      iconColor: "text-slate-600 dark:text-slate-300",
      iconBg: "bg-slate-500/10 dark:bg-slate-400/15",
      onClick: () => goToComplaints("SUBMITTED"),
    },
    {
      label: "Under Review",
      value: statistics?.underReview || 0,
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
      onClick: () => goToComplaints("UNDER_REVIEW"),
    },
    {
      label: "Assigned",
      value: statistics?.assigned || 0,
      icon: UserCog,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
      onClick: () => goToComplaints("ASSIGNED"),
    },
    {
      label: "In Progress",
      value: statistics?.inProgress || 0,
      icon: FolderKanban,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
      onClick: () => goToComplaints("IN_PROGRESS"),
    },
    {
      label: "Resolved",
      value: statistics?.resolved || 0,
      icon: CheckCircle2,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500/10 dark:bg-green-500/15",
      onClick: () => goToComplaints("RESOLVED"),
    },
    {
      label: "Closed",
      value: statistics?.closed || 0,
      icon: Layers,
      iconColor: "text-slate-600 dark:text-slate-300",
      iconBg: "bg-slate-500/10 dark:bg-slate-400/15",
      onClick: () => goToComplaints("CLOSED"),
    },
    {
      label: "Rejected",
      value: statistics?.rejected || 0,
      icon: XCircle,
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500/10 dark:bg-red-500/15",
      onClick: () => goToComplaints("REJECTED"),
    },
    {
      label: "Reopened",
      value: statistics?.reopened || 0,
      icon: RotateCcw,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
      onClick: () => goToComplaints("REOPENED"),
    },
  ];

  const goToComplaints = (status) => {
    if (status) {
      navigate(`/admin/complaints?status=${status}`);
      return;
    }

    navigate("/admin/complaints");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Complaint Management System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              className="w-full rounded-lg border border-transparent bg-card p-6 text-left shadow-sm transition hover:border-border hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>

                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <stat.icon className={`size-4 ${stat.iconColor}`} />
                </span>
              </div>

              <p className="mt-2 text-3xl font-bold text-card-foreground">
                {stat.value}
              </p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground">
            Quick Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/complaints")}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Inbox className="size-4" />
              View All Complaints
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-medium text-foreground transition hover:bg-accent"
            >
              <Users className="size-4" />
              Manage Users
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/departments")}
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-medium text-foreground transition hover:bg-accent"
            >
              <Layers className="size-4" />
              Manage Departments
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-medium text-foreground transition hover:bg-accent"
            >
              <Tags className="size-4" />
              Manage Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
