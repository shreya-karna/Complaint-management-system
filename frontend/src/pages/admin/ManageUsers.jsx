import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import provinces from "../../data/provinces.json";
import districts from "../../data/districts.json";
import localLevels from "../../data/localLevels.json";

import { createUser, getUsers, updateUser } from "../../services/userService";

import { getDepartments } from "../../services/departmentService";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",

    address: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
      tole: "",
      houseNumber: "",
    },

    employeeId: "",
    designation: "",
    password: "",
    role: "CITIZEN",
    departmentId: "",
  });

  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const [filteredLocalLevels, setFilteredLocalLevels] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersResponse, departmentsResponse] = await Promise.all([
        getUsers(),
        getDepartments(),
      ]);

      setUsers(usersResponse.users || []);

      setDepartments(departmentsResponse.departments || []);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    /*
     * Province
     *
     * provinces.json:
     * code
     * name_en
     * name_ne
     */
    if (name === "province") {
      const selectedProvince = provinces.find(
        (province) => String(province.code) === String(value),
      );

      const provinceDistricts = districts.filter(
        (district) => String(district.province_code) === String(value),
      );

      setFilteredDistricts(provinceDistricts);
      setFilteredLocalLevels([]);

      setFormData((previous) => ({
        ...previous,

        address: {
          ...previous.address,

          province: selectedProvince?.name_en || "",

          district: "",
          municipality: "",
          ward: "",
        },
      }));

      return;
    }

    /*
     * District
     *
     * districts.json:
     * code
     * name_en
     * province_code
     */
    if (name === "district") {
      const selectedDistrict = districts.find(
        (district) => String(district.code) === String(value),
      );

      const districtLocalLevels = localLevels.filter(
        (localLevel) => String(localLevel.district_code) === String(value),
      );

      setFilteredLocalLevels(districtLocalLevels);

      setFormData((previous) => ({
        ...previous,

        address: {
          ...previous.address,

          district: selectedDistrict?.name_en || "",

          municipality: "",
          ward: "",
        },
      }));

      return;
    }

    /*
     * Municipality / Rural Municipality
     *
     * localLevels.json:
     * code
     * name_en
     * district_code
     * province_code
     */
    if (name === "municipality") {
      const selectedLocalLevel = localLevels.find(
        (localLevel) => String(localLevel.code) === String(value),
      );

      setFormData((previous) => ({
        ...previous,

        address: {
          ...previous.address,

          municipality: selectedLocalLevel?.name_en || "",

          ward: "",
        },
      }));

      return;
    }

    /*
     * Ward, Tole and House Number
     */
    setFormData((previous) => ({
      ...previous,

      address: {
        ...previous.address,
        [name]: value,
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",

      address: {
        province: "",
        district: "",
        municipality: "",
        ward: "",
        tole: "",
        houseNumber: "",
      },

      employeeId: "",
      designation: "",
      password: "",
      role: "CITIZEN",
      departmentId: "",
    });

    setEditingUser(null);
    setFilteredDistricts([]);
    setFilteredLocalLevels([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,

        address: formData.address,

        employeeId: formData.employeeId,
        designation: formData.designation,
        role: formData.role,

        departmentId:
          formData.role === "CITIZEN" ? null : formData.departmentId || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await updateUser(editingUser._id, payload);
      } else {
        if (!formData.password) {
          alert("Password is required when creating a user.");

          return;
        }

        await createUser(payload);
      }

      alert(
        editingUser
          ? "User updated successfully."
          : "User created successfully.",
      );

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save user:", error);

      alert(error.response?.data?.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);

    /*
     * Find the province using the stored
     * English province name.
     */
    const selectedProvince = provinces.find(
      (province) => province.name_en === user.address?.province,
    );

    /*
     * Find the district using the stored
     * English district name.
     */
    const selectedDistrict = districts.find(
      (district) => district.name_en === user.address?.district,
    );

    /*
     * Load districts belonging to
     * the selected province.
     */
    if (selectedProvince) {
      setFilteredDistricts(
        districts.filter(
          (district) =>
            String(district.province_code) === String(selectedProvince.code),
        ),
      );
    } else {
      setFilteredDistricts([]);
    }

    /*
     * Load municipalities belonging to
     * the selected district.
     */
    if (selectedDistrict) {
      setFilteredLocalLevels(
        localLevels.filter(
          (localLevel) =>
            String(localLevel.district_code) === String(selectedDistrict.code),
        ),
      );
    } else {
      setFilteredLocalLevels([]);
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",

      address: {
        province: user.address?.province || "",

        district: user.address?.district || "",

        municipality: user.address?.municipality || "",

        ward: user.address?.ward || "",

        tole: user.address?.tole || "",

        houseNumber: user.address?.houseNumber || "",
      },

      employeeId: user.employeeId || "",

      designation: user.designation || "",

      password: "",

      role: user.role || "CITIZEN",

      departmentId: user.departmentId?._id || user.departmentId || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user._id, {
        isActive: !user.isActive,
      });

      fetchData();
    } catch (error) {
      console.error("Failed to update user status:", error);

      alert(error.response?.data?.message || "Failed to update user status.");
    }
  };

  const isStaffOrAdmin = formData.role === "STAFF" || formData.role === "ADMIN";

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>

          <p className="mt-2 text-muted-foreground">
            Create, update and manage system users.
          </p>
        </div>

        {/* User Form */}
        <div className="mb-8 rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter the user's information below.
              </p>
            </div>

            {editingUser && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-primary-foreground hover:bg-red-700"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    <option value="CITIZEN">Citizen</option>

                    <option value="STAFF">Staff</option>

                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Address
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Province */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Province
                  </label>

                  <select
                    name="province"
                    value={
                      provinces.find(
                        (province) =>
                          province.name_en === formData.address.province,
                      )?.code || ""
                    }
                    onChange={handleAddressChange}
                    className="w-full rounded-md border border-input px-3 py-2"
                  >
                    <option value="">Select Province</option>

                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    District
                  </label>

                  <select
                    name="district"
                    value={
                      districts.find(
                        (district) =>
                          district.name_en === formData.address.district,
                      )?.code || ""
                    }
                    onChange={handleAddressChange}
                    disabled={!formData.address.province}
                    className="w-full rounded-md border border-input px-3 py-2 disabled:bg-muted"
                  >
                    <option value="">
                      {formData.address.province
                        ? "Select District"
                        : "Select Province First"}
                    </option>

                    {filteredDistricts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Municipality / Rural Municipality
                  </label>

                  <select
                    name="municipality"
                    value={
                      localLevels.find(
                        (localLevel) =>
                          localLevel.name_en === formData.address.municipality,
                      )?.code || ""
                    }
                    onChange={handleAddressChange}
                    disabled={!formData.address.district}
                    className="w-full rounded-md border border-input px-3 py-2 disabled:bg-muted"
                  >
                    <option value="">
                      {formData.address.district
                        ? "Select Municipality / Rural Municipality"
                        : "Select District First"}
                    </option>

                    {filteredLocalLevels.map((localLevel) => (
                      <option
                        key={`${localLevel.district_code}-${localLevel.code}-${localLevel.name_en}`}
                        value={localLevel.code}
                      >
                        {localLevel.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ward No.
                  </label>

                  <input
                    type="text"
                    name="ward"
                    value={formData.address.ward}
                    onChange={handleAddressChange}
                    placeholder="e.g. 10"
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {/* Tole */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Tole / Street
                  </label>

                  <input
                    type="text"
                    name="tole"
                    value={formData.address.tole}
                    onChange={handleAddressChange}
                    placeholder="e.g. Baneshwor"
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {/* House Number */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    House No.
                  </label>

                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.address.houseNumber}
                    onChange={handleAddressChange}
                    placeholder="e.g. 123"
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Official Information */}
            {isStaffOrAdmin && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Official Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Employee ID */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Employee ID
                    </label>

                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input px-3 py-2"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Designation
                    </label>

                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input px-3 py-2"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Department
                    </label>

                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input px-3 py-2"
                    >
                      <option value="">Select Department</option>

                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Account Security */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Account Security
              </h3>

              <div className="max-w-md">
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    className="w-full rounded-md border border-input px-3 py-2 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingUser
                    ? "Update User"
                    : "Create User"}
              </button>

              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-input px-5 py-2.5 hover:bg-accent"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="rounded-xl bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-semibold text-foreground">Users</h2>
          </div>

          {loading ? (
            <div className="p-6 text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>

                    <th className="px-6 py-4 font-semibold">Email</th>

                    <th className="px-6 py-4 font-semibold">Role</th>

                    <th className="px-6 py-4 font-semibold">Department</th>

                    <th className="px-6 py-4 font-semibold">Status</th>

                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b last:border-b-0">
                      <td className="px-6 py-4">{user.name}</td>

                      <td className="px-6 py-4">{user.email}</td>

                      <td className="px-6 py-4">{user.role}</td>

                      <td className="px-6 py-4">
                        {user.departmentName || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            user.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-md border border-input px-3 py-1.5 hover:bg-accent"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            className="rounded-md border border-input px-3 py-1.5 hover:bg-accent"
                          >
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;