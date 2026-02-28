"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";

/* ─── tiny reusable components ─── */
function StatCard({ label, value, icon, color = "green" }) {
  const colors = {
    green: "border-l-green-500 text-green-600",
    blue: "border-l-blue-500 text-blue-600",
    orange: "border-l-orange-500 text-orange-600",
    purple: "border-l-purple-500 text-purple-600",
    red: "border-l-red-500 text-red-600",
    yellow: "border-l-yellow-500 text-yellow-600",
  };
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colors[color]?.split(" ")[0]}`}>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${colors[color]?.split(" ")[1] || "text-gray-800"}`}>
        {icon} {value}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── stats ── */
  const [stats, setStats] = useState(null);

  /* ── active panel: null | 'users' | 'crops' | 'inputs' | 'workers' ── */
  const [panel, setPanel] = useState(null);

  /* ── panel data ── */
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  /* ── new‑item forms ── */
  const [newCrop, setNewCrop] = useState({ name: "", variety: "" });
  const [newInput, setNewInput] = useState({ name: "", type: "", unit_default: "" });
  const [newWorker, setNewWorker] = useState({ name: "", phone: "", farm_id: "" });
  const [farms, setFarms] = useState([]);

  /* ============================
     AUTH CHECK
  ============================ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/farmer/dashboard");
        return;
      }
      setUser(parsedUser);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* ============================
     LOAD STATS
  ============================ */
  const loadStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Load stats error:", err);
    }
  }, []);

  useEffect(() => {
    if (user) loadStats();
  }, [user, loadStats]);

  /* ============================
     PANEL LOADERS
  ============================ */
  const loadUsers = async () => {
    setPanelLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Load users error:", err);
      toast.error("Failed to load users");
    } finally {
      setPanelLoading(false);
    }
  };

  const loadCrops = async () => {
    setPanelLoading(true);
    try {
      const res = await api.get("/crops");
      setCrops(res.data || []);
    } catch (err) {
      console.error("Load crops error:", err);
      toast.error("Failed to load crops");
    } finally {
      setPanelLoading(false);
    }
  };

  const loadInputs = async () => {
    setPanelLoading(true);
    try {
      const res = await api.get("/inputs");
      setInputs(res.data || []);
    } catch (err) {
      console.error("Load inputs error:", err);
      toast.error("Failed to load inputs");
    } finally {
      setPanelLoading(false);
    }
  };

  const loadWorkers = async () => {
    setPanelLoading(true);
    try {
      const [wRes, fRes] = await Promise.all([
        api.get("/workers"),
        api.get("/farms"),
      ]);
      setWorkers(wRes.data || []);
      setFarms(fRes.data || []);
    } catch (err) {
      console.error("Load workers error:", err);
      toast.error("Failed to load workers");
    } finally {
      setPanelLoading(false);
    }
  };

  const openPanel = (name) => {
    setPanel(name);
    if (name === "users") loadUsers();
    else if (name === "crops") loadCrops();
    else if (name === "inputs") loadInputs();
    else if (name === "workers") loadWorkers();
  };

  /* ============================
     CREATE / DELETE HANDLERS
  ============================ */
  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      loadUsers();
      loadStats();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!newCrop.name.trim()) return toast.error("Crop name required");
    try {
      await api.post("/crops", newCrop);
      toast.success("Crop added");
      setNewCrop({ name: "", variety: "" });
      loadCrops();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add crop");
    }
  };

  const handleDeleteCrop = async (id) => {
    if (!confirm("Delete this crop?")) return;
    try {
      await api.delete(`/crops/${id}`);
      toast.success("Crop deleted");
      loadCrops();
      loadStats();
    } catch {
      toast.error("Failed to delete crop");
    }
  };

  const handleAddInput = async (e) => {
    e.preventDefault();
    if (!newInput.name.trim()) return toast.error("Input name required");
    try {
      await api.post("/inputs", newInput);
      toast.success("Input added");
      setNewInput({ name: "", type: "", unit_default: "" });
      loadInputs();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add input");
    }
  };

  const handleDeleteInput = async (id) => {
    if (!confirm("Delete this input?")) return;
    try {
      await api.delete(`/inputs/${id}`);
      toast.success("Input deleted");
      loadInputs();
      loadStats();
    } catch {
      toast.error("Failed to delete input");
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!newWorker.name.trim()) return toast.error("Worker name required");
    if (!newWorker.farm_id) return toast.error("Select a farm");
    try {
      await api.post("/workers", newWorker);
      toast.success("Worker added");
      setNewWorker({ name: "", phone: "", farm_id: "" });
      loadWorkers();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add worker");
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!confirm("Delete this worker?")) return;
    try {
      await api.delete(`/workers/${id}`);
      toast.success("Worker deleted");
      loadWorkers();
      loadStats();
    } catch {
      toast.error("Failed to delete worker");
    }
  };

  /* ============================
     LOGOUT
  ============================ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("preferredRole");
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || "Admin"}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Users" value={stats?.total_users ?? "–"} icon="👥" color="blue" />
          <StatCard label="Farms" value={stats?.total_farms ?? "–"} icon="🏡" color="green" />
          <StatCard label="Activities (7d)" value={stats?.recent_activities ?? "–"} icon="📝" color="orange" />
          <StatCard label="Workers" value={stats?.total_workers ?? "–"} icon="👷" color="purple" />
          <StatCard label="Crops" value={stats?.total_crops ?? "–"} icon="🌾" color="yellow" />
          <StatCard label="Inputs" value={stats?.total_inputs ?? "–"} icon="📦" color="red" />
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: "users", icon: "👥", title: "Manage Users", desc: "View and manage user accounts" },
            { key: "crops", icon: "🌾", title: "Crop Master", desc: "Add or remove crops" },
            { key: "inputs", icon: "📦", title: "Input Master", desc: "Manage seeds, fertilizers, pesticides" },
            { key: "workers", icon: "👷", title: "Worker Master", desc: "Manage farm workers" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => openPanel(panel === item.key ? null : item.key)}
              className={`rounded-xl shadow-md p-6 hover:shadow-lg transition text-left ${
                panel === item.key ? "bg-blue-50 ring-2 ring-blue-400" : "bg-white"
              }`}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* ── Panels ── */}
        {panel && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {panelLoading && (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            )}

            {/* ── USERS ── */}
            {panel === "users" && !panelLoading && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  All Users ({users.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Phone</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2 pr-4">Joined</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-800">{u.id}</td>
                          <td className="py-2 pr-4 text-gray-800 font-medium">{u.name}</td>
                          <td className="py-2 pr-4 text-gray-600">{u.phone}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.role === "admin" ? "bg-blue-100 text-blue-800" :
                              u.role === "expert" ? "bg-purple-100 text-purple-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-gray-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "–"}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── CROPS ── */}
            {panel === "crops" && !panelLoading && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Crops ({crops.length})
                </h2>
                {/* Add form */}
                <form onSubmit={handleAddCrop} className="flex flex-wrap gap-3 mb-4 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input
                      value={newCrop.name}
                      onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                      placeholder="e.g. Wheat"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Variety</label>
                    <input
                      value={newCrop.variety}
                      onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
                      placeholder="optional"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
                  >
                    + Add Crop
                  </button>
                </form>
                {/* List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {crops.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                        {c.variety && <span className="text-xs text-gray-500 ml-2">({c.variety})</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteCrop(c.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── INPUTS ── */}
            {panel === "inputs" && !panelLoading && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Inputs ({inputs.length})
                </h2>
                {/* Add form */}
                <form onSubmit={handleAddInput} className="flex flex-wrap gap-3 mb-4 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input
                      value={newInput.name}
                      onChange={(e) => setNewInput({ ...newInput, name: e.target.value })}
                      placeholder="e.g. Urea"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={newInput.type}
                      onChange={(e) => setNewInput({ ...newInput, type: e.target.value })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    >
                      <option value="">Select type</option>
                      <option value="seed">Seed</option>
                      <option value="fertilizer">Fertilizer</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="water">Water</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Default unit</label>
                    <input
                      value={newInput.unit_default}
                      onChange={(e) => setNewInput({ ...newInput, unit_default: e.target.value })}
                      placeholder="kg, L, ml"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
                  >
                    + Add Input
                  </button>
                </form>
                {/* List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {inputs.map((inp) => (
                    <div key={inp.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="font-medium text-gray-800">{inp.name}</span>
                        {inp.type && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {inp.type}
                          </span>
                        )}
                        {inp.unit_default && (
                          <span className="text-xs text-gray-500 ml-1">({inp.unit_default})</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteInput(inp.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── WORKERS ── */}
            {panel === "workers" && !panelLoading && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Workers ({workers.length})
                </h2>
                {/* Add form */}
                <form onSubmit={handleAddWorker} className="flex flex-wrap gap-3 mb-4 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      placeholder="Worker name"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                      placeholder="optional"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Farm *</label>
                    <select
                      value={newWorker.farm_id}
                      onChange={(e) => setNewWorker({ ...newWorker, farm_id: e.target.value })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    >
                      <option value="">Select farm</option>
                      {farms.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
                  >
                    + Add Worker
                  </button>
                </form>
                {/* List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Phone</th>
                        <th className="py-2 pr-4">Farm ID</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((w) => (
                        <tr key={w.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-800">{w.id}</td>
                          <td className="py-2 pr-4 text-gray-800 font-medium">{w.name}</td>
                          <td className="py-2 pr-4 text-gray-600">{w.phone || "–"}</td>
                          <td className="py-2 pr-4 text-gray-600">{w.farm_id}</td>
                          <td className="py-2">
                            <button
                              onClick={() => handleDeleteWorker(w.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Account Info ── */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Admin Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-medium text-gray-800">{user?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-medium text-blue-600 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-lg font-medium text-gray-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
