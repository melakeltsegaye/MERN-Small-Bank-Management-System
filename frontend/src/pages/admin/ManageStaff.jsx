import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Badge from "../../components/common/Badge.jsx";
import Alert from "../../components/common/Alert.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getUsersApi, createStaffUserApi, updateUserRoleApi, updateUserStatusApi } from "../../api/userApi.js";

const STAFF_ROLES = ["employee", "loan_officer", "manager", "admin"];

const ManageStaff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    branch: "",
    employeeId: "",
  });

  const load = async () => {
    setLoading(true);
    const { data } = await getUsersApi({ limit: 100 });
    setUsers(data.users.filter((u) => u.role !== "customer"));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createStaffUserApi(form);
      setSuccess("Staff account created.");
      setForm({ name: "", email: "", password: "", role: "employee", branch: "", employeeId: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create staff account.");
    } finally {
      setSubmitting(false);
    }
  };

  const changeRole = async (id, role) => {
    await updateUserRoleApi(id, role);
    await load();
  };

  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "active" ? "suspended" : "active";
    await updateUserStatusApi(id, next);
    await load();
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl mb-8">Manage staff</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card p-6 h-fit sticky top-24">
          <h2 className="font-display text-xl mb-4">New staff account</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Alert>{error}</Alert>
            <Alert type="success">{success}</Alert>

            <div>
              <label className="field-label">Full name</label>
              <input className="field-input" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" type="email" name="email" required value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Temporary password</label>
              <input className="field-input" type="password" name="password" required minLength={8} value={form.password} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Role</label>
              <select className="field-input" name="role" value={form.role} onChange={handleChange}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Branch</label>
              <input className="field-input" name="branch" value={form.branch} onChange={handleChange} placeholder="Bole Branch" />
            </div>
            <div>
              <label className="field-label">Employee ID</label>
              <input className="field-input" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="EMP-0042" />
            </div>
            <button type="submit" disabled={submitting} className="btn-brass">
              {submitting ? "Creating…" : "Create staff account"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3">
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-line text-left text-paper-dim text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-ink-line last:border-0 hover:bg-ink-raised/50">
                    <td className="px-5 py-3">
                      <p>{u.name}</p>
                      <p className="text-xs text-paper-dim">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        className="bg-ink border border-ink-line rounded px-2 py-1 text-xs capitalize"
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                      >
                        {STAFF_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <Badge>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => toggleStatus(u._id, u.status)} className="btn-ghost !py-1.5 !px-3 text-xs">
                        {u.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageStaff;
