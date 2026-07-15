import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers, createStaffUser, updateUserStatus, updateUserRole } from "../../api/userApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

const STAFF_ROLES = ["employee", "loan_officer", "manager", "admin"];

const ManageEmployees = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["users", "staff"], queryFn: () => getUsers({ limit: 200 }) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users", "staff"] });

  const onSubmit = async (values) => {
    setMessage(null);
    try {
      await createStaffUser(values);
      setMessage({ type: "success", text: "Staff account created." });
      reset();
      setShowForm(false);
      invalidate();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create staff account" });
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    await updateUserStatus(user._id, nextStatus);
    invalidate();
  };

  const handleRoleChange = async (user, role) => {
    await updateUserRole(user._id, role);
    invalidate();
  };

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Staff & roles"
        description="Create staff accounts and manage roles."
        action={
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm">
            {showForm ? "Close" : "Add staff member"}
          </button>
        }
      />

      {message && (
        <div
          className={`text-sm rounded-lg px-3.5 py-2.5 mb-4 border ${
            message.type === "success"
              ? "bg-vault-emerald/10 border-vault-emerald/30 text-vault-emeraldLight"
              : "bg-vault-alert/10 border-vault-alert/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 mb-8 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input-field" {...register("name", { required: true })} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input-field" {...register("role", { required: true })}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">{r.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" {...register("email", { required: true })} />
            </div>
            <div>
              <label className="label">Temporary password</label>
              <input type="password" className="input-field" {...register("password", { required: true, minLength: 8 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Branch</label>
              <input className="input-field" placeholder="Downtown" {...register("branch")} />
            </div>
            <div>
              <label className="label">Employee ID</label>
              <input className="input-field" placeholder="EMP-0021" {...register("employeeId")} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create staff account</button>
        </form>
      )}

      {isLoading ? (
        <Loader label="Fetching staff" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-700/50 text-parchment-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-right px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u._id} className="border-t border-ink-700">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-parchment-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs capitalize"
                    >
                      <option value="customer">Customer</option>
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right"><Badge status={u.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleStatusToggle(u)} className="text-xs text-vault-goldLight hover:underline">
                      {u.status === "active" ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
