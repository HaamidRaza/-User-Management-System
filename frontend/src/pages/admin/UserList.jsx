import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Edit3,
  Mail,
  Calendar,
} from "lucide-react";
import useSWR from "swr";
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

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/users", page, debouncedSearch, roleFilter, statusFilter],
    () =>
      userService.getUsers({
        page,
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        limit: 10,
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1 };

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, roleFilter, statusFilter, page, setSearchParams]);

  useEffect(() => {
    if (error) toast.error("Failed to load users");
  }, [error]);

  const handleToggleStatus = async (id, currentStatus) => {
    const isDeactivating = currentStatus === "active";
    if (!window.confirm(isDeactivating ? "Deactivate user?" : "Activate user?"))
      return;
    try {
      if (isDeactivating) await userService.deleteUser(id);
      else await userService.updateUser(id, { status: "active" });
      toast.success(`User ${isDeactivating ? "deactivated" : "activated"}`);
      mutate();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#61210F] tracking-tight">
              System Directory
            </h2>
            <p className="text-[#61210F]/50 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
              Platform Members & Access
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/users/new"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#61210F] text-[#F9EDCC] rounded-xl text-sm font-black uppercase tracking-widest shadow-md hover:opacity-95 transition-all active:scale-95"
            >
              <UserPlus size={18} /> New Member
            </Link>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#61210F]/10 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61210F]/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Search identity..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9EDCC]/10 border border-[#61210F]/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EDAE49]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:w-32 cursor-pointer bg-white border border-[#61210F]/10 rounded-xl text-xs font-bold uppercase tracking-wider px-3 py-2.5 focus:ring-2 focus:ring-[#EDAE49] outline-none"
            >
              <option value="">All Roles</option>
              {isAdmin && <option value="admin">Admin</option>}
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:w-32 bg-white border cursor-pointer border-[#61210F]/10 rounded-xl text-xs font-bold uppercase tracking-wider px-3 py-2.5 focus:ring-2 focus:ring-[#EDAE49] outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(search || roleFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch(""); // ✅ also reset debounced value immediately
                  setRoleFilter("");
                  setStatusFilter("");
                  setPage(1);
                }}
                className="p-2.5 text-[#EA2B1F] bg-[#EA2B1F]/5 rounded-xl hover:bg-[#EA2B1F]/10 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#61210F]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#61210F]/2 border-b border-[#61210F]/5">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#61210F]/40">
                    Identity
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#61210F]/40">
                    Role
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#61210F]/40">
                    Status
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#61210F]/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#61210F]/5">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="group hover:bg-[#F9EDCC]/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#61210F] text-[#F9EDCC] flex items-center justify-center font-bold text-sm shadow-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#61210F]">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-[#61210F]/50 font-medium">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ROLE_THEME[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${u.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionButtons
                        user={u}
                        isAdmin={isAdmin}
                        isAdminOrManager={isAdminOrManager}
                        onToggle={handleToggleStatus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-[#61210F]/5">
            {users.map((u) => (
              <div key={u._id} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#61210F] text-[#F9EDCC] flex items-center justify-center font-bold text-lg shadow-md">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-[#61210F]">{u.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${ROLE_THEME[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                  <ActionButtons
                    user={u}
                    isAdmin={isAdmin}
                    isAdminOrManager={isAdminOrManager}
                    onToggle={handleToggleStatus}
                    isMobile
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#61210F]/2 p-3 rounded-xl border border-[#61210F]/5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#61210F]/30 uppercase tracking-widest flex items-center gap-1">
                      <Mail size={10} /> Email
                    </p>
                    <p className="text-[11px] font-bold text-[#61210F] truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#61210F]/30 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> Joined
                    </p>
                    <p className="text-[11px] font-bold text-[#61210F]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && users.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[#61210F]/30 font-bold uppercase tracking-[0.2em] text-xs">
                No records found
              </p>
            </div>
          )}

          <div className="px-6 py-5 bg-[#61210F]/2 border-t border-[#61210F]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-[#61210F]/40 uppercase tracking-widest">
              Records <span className="text-[#61210F]">{users.length}</span> of{" "}
              <span className="text-[#61210F]">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2.5 bg-white border border-[#61210F]/10 rounded-xl disabled:opacity-20 hover:bg-[#F9EDCC]/30 transition-all"
              >
                <ChevronLeft size={18} className="text-[#61210F]" />
              </button>
              <span className="text-[11px] font-black text-[#61210F]">
                PAGE {page} / {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2.5 bg-white border border-[#61210F]/10 rounded-xl disabled:opacity-20 hover:bg-[#F9EDCC]/30 transition-all"
              >
                <ChevronRight size={18} className="text-[#61210F]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ActionButtons = ({
  user,
  isAdmin,
  isAdminOrManager,
  onToggle,
  isMobile,
}) => (
  <div className={`flex items-center gap-1 ${isMobile ? "" : "justify-end"}`}>
    <Link
      to={`/users/${user._id}`}
      className="p-2 text-[#61210F]/60 hover:text-[#61210F] hover:bg-[#F9EDCC] rounded-lg transition-all"
      title="View Profile"
    >
      <MoreHorizontal size={18} />
    </Link>
    {isAdminOrManager && user.role !== "admin" && (
      <Link
        to={`/users/${user._id}/edit`}
        className="p-2 text-[#61210F]/60 hover:text-[#61210F] hover:bg-[#F9EDCC] rounded-lg transition-all"
        title="Edit"
      >
        <Edit3 size={18} />
      </Link>
    )}
    {isAdminOrManager && user.role !== "admin" && (
      <button
        onClick={() => onToggle(user._id, user.status)}
        className={`p-2 rounded-lg transition-all cursor-pointer ${user.status === "active" ? "text-[#EA2B1F] hover:bg-[#EA2B1F]/10" : "text-green-600 hover:bg-green-50"}`}
      >
        {user.status === "active" ? (
          <UserX size={18} />
        ) : (
          <UserCheck size={18} />
        )}
      </button>
    )}
  </div>
);

export default UserList;
