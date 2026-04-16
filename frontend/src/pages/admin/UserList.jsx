import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const ROLE_THEME = {
  admin: "bg-[#EA2B1F] text-white",
  manager: "bg-[#EDAE49] text-[#61210F]",
  user: "bg-[#F9DF74] text-[#61210F]",
};

const UserList = () => {
  const { isAdmin, isAdminOrManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await userService.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce API calls by 300ms
    return () => clearTimeout(handler);
  }, [fetchUsers]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, roleFilter, statusFilter, page, setSearchParams]);

  const handleToggleStatus = async (id, currentStatus) => {
    const isDeactivating = currentStatus === "active";
    const confirmMsg = isDeactivating 
      ? "Deactivating will restrict user access. Continue?" 
      : "Reactivate this user account?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      if (isDeactivating) {
        await userService.deleteUser(id);
        toast.success("User deactivated");
      } else {
        await userService.updateUser(id, { status: "active" });
        toast.success("User reactivated");
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#61210F] tracking-tight">Users</h2>
            <p className="text-[#61210F]/60 text-sm mt-1">Manage platform members and their access levels.</p>
          </div>
          {isAdmin && (
            <Link to="/users/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EA2B1F] text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95">
              <UserPlus size={18} /> New User
            </Link>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#61210F]/10 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61210F]/30" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F9EDCC]/20 border border-[#61210F]/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EDAE49]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#61210F]/40 ml-2" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-white border cursor-pointer border-[#61210F]/10 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-[#EDAE49] outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-white border cursor-pointer border-[#61210F]/10 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-[#EDAE49] outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(search || roleFilter || statusFilter) && (
              <button onClick={clearFilters} className="p-2 text-[#EA2B1F] hover:bg-[#EA2B1F]/5 rounded-lg transition-colors" title="Clear Filters">
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white border border-[#61210F]/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#61210F]/[0.02] border-b border-[#61210F]/10">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">User Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">Joined Date</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#61210F]/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4"><div className="h-10 bg-gray-100 rounded" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#61210F]/40 text-sm italic">No users matching your criteria.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#61210F]/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#61210F] text-[#F9EDCC] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#61210F]">{u.name}</p>
                            <p className="text-xs text-[#61210F]/50">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_THEME[u.role] || ROLE_THEME.user}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-[#61210F]/30'}`} />
                          <span className={`text-xs font-medium capitalize ${u.status === 'active' ? 'text-green-700' : 'text-[#61210F]/40'}`}>
                            {u.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#61210F]/60">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/users/${u._id}`} className="p-1.5 text-[#61210F]/60 hover:text-[#61210F] hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                            <MoreHorizontal size={18} />
                          </Link>
                          {isAdminOrManager && u.role !== "admin" && (
                            <Link to={`/users/${u._id}/edit`} className="p-1.5 text-[#61210F]/60 hover:text-[#61210F] hover:bg-gray-100 rounded-lg transition-colors" title="Edit User">
                              <Edit3 size={18} />
                            </Link>
                          )}
                          {isAdmin && (
                            <button 
                              onClick={() => handleToggleStatus(u._id, u.status)}
                              className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "text-[#EA2B1F] hover:bg-[#EA2B1F]/10" : "text-green-600 hover:bg-green-50"}`}
                              title={u.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {u.status === "active" ? <UserX size={18} /> : <UserCheck size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#61210F]/[0.02] border-t border-[#61210F]/10 flex items-center justify-between">
            <p className="text-xs font-medium text-[#61210F]/50">
              Showing <span className="text-[#61210F] font-bold">{users.length}</span> of <span className="text-[#61210F] font-bold">{pagination.total}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-[#61210F]/10 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-[#61210F]"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-bold text-[#61210F] px-4">
                Page {pagination.page} / {pagination.pages}
              </div>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-[#61210F]/10 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-[#61210F]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Internal Edit icon not imported above
const Edit3 = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);

export default UserList;