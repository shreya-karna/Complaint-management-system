import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getDepartments } from "@/services/departmentService";

function DepartmentSelection() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDepartments();

        const activeDepartments = (response.departments || []).filter(
          (department) => department.isActive === true,
        );

        setDepartments(activeDepartments);
      } catch (error) {
        console.error("Failed to load departments:", error);

        setError("Failed to load departments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  const handleDepartmentSelect = (department) => {
    navigate("/submit-complaint", {
      state: {
        department: {
          id: department._id,
          name: department.name,
          description: department.description || "",
        },
      },
    });
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-200/60 hover:text-foreground dark:hover:bg-slate-800"
          >
            <ChevronLeft className="size-4" />
            Back to Dashboard
          </button>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Submit a Complaint
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Select a Department
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Choose the department responsible for handling your complaint. You
            will provide the complaint details on the next step.
          </p>
        </div>

        {loading && (
          <div className="py-10 text-center text-muted-foreground">
            Loading departments...
          </div>
        )}

        {!loading && error && (
          <div className="py-10 text-center text-red-600">{error}</div>
        )}

        {!loading && !error && departments.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            No departments are currently available.
          </div>
        )}

        {!loading && !error && departments.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {departments.map((department) => (
              <Card
                key={department._id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleDepartmentSelect(department)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="size-5 text-primary" />
                    </div>

                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>

                  <CardTitle className="mt-4">{department.name}</CardTitle>

                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDepartmentSelect(department);
                    }}
                  >
                    Select Department
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default DepartmentSelection;
