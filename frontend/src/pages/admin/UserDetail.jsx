import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  UserX,
  UserCheck,
  History,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Fingerprint,
} from "lucide-react";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const ROLE_THEME = {
  admin: "bg-[#EA2B1F] text-white",
  manager: "bg-[#EDAE49] text-[#61210F]",
  user: "bg-[#F9DF74] text-[#61210F]",
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, isAdminOrManager } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSelf = currentUser?._id === id;
  const canEdit = user && isAdminOrManager && !isSelf && user.role !== "admin";
  const canToggleStatus = isAdmin && !isSelf;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load user");
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id, navigate]);

  const handleStatusToggle = async () => {
    const isActivating = user.status !== "active";
    if (
      !isActivating &&
      !window.confirm(
        "Deactivate this user? Access will be immediately revoked.",
      )
    )
      return;

    try {
      let updated;
      if (isActivating) {
        updated = await userService.updateUser(id, { status: "active" });
        toast.success("User account reactivated");
      } else {
        await userService.deleteUser(id);
        toast.success("User account deactivated");
        updated = await userService.getUserById(id);
      }
      setUser(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  
      if (loading)
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="animate-pulse text-[#61210F]/40 font-bold tracking-widest uppercase text-sm">
            Loading Identity...
          </div>
        </div>
      </Layout>
    );

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            className="flex items-center gap-2 text-sm font-bold text-[#61210F]/60 hover:text-[#61210F] transition-colors group"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Directory
          </button>

          <div className="flex items-center gap-3">
            {canEdit && (
              <Link
                to={`/users/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#61210F]/10 rounded-lg text-sm font-bold text-[#61210F] hover:bg-gray-50 transition-all shadow-sm"
              >
                <Edit3 size={16} /> Edit Profile
              </Link>
            )}
            {canToggleStatus && (
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${user.status === "active" ? "bg-[#EA2B1F] hover:opacity-90" : "bg-green-600 hover:bg-green-700"}`}
                onClick={handleStatusToggle}
              >
                {user.status === "active" ? (
                  <>
                    <UserX size={16} /> Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck size={16} /> Activate
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#61210F]/10 rounded-2xl p-8 text-center shadow-sm">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-3xl bg-[#61210F] text-[#F9EDCC] text-4xl font-bold flex items-center justify-center mx-auto shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${user.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                />
              </div>
              <h2 className="text-xl font-bold text-[#61210F]">{user.name}</h2>
              <p className="text-sm text-[#61210F]/50 mb-6">{user.email}</p>

              <div className="flex flex-col gap-2">
                <span
                  className={`inline-flex items-center justify-center gap-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${ROLE_THEME[user.role]}`}
                >
                  <Shield size={12} /> {user.role}
                </span>
                <span
                  className={`inline-flex items-center justify-center gap-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-[#61210F]/10 ${user.status === "active" ? "text-green-600" : "text-[#61210F]/40"}`}
                >
                  {user.status} account
                </span>
              </div>
            </div>
          </div>

          {/* Details & Audit Trail */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Info */}
            <div className="bg-white border border-[#61210F]/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#61210F]/5 bg-[#61210F]/2 flex items-center gap-2">
                <UserIcon size={16} className="text-[#61210F]/40" />
                <h3 className="text-xs font-bold text-[#61210F]/60 uppercase tracking-widest">
                  Account Information
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoBlock
                  label="Full Legal Name"
                  value={user.name}
                  icon={UserIcon}
                />
                <InfoBlock
                  label="Primary Email"
                  value={user.email}
                  icon={Mail}
                />
                <InfoBlock
                  label="Registration Date"
                  value={fmt(user.createdAt)}
                  icon={Calendar}
                />
                <InfoBlock
                  label="Unique ID"
                  value={user._id}
                  icon={Fingerprint}
                />
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-[#61210F]/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#61210F]/5 bg-[#61210F]/2 flex items-center gap-2">
                <History size={16} className="text-[#61210F]/40" />
                <h3 className="text-xs font-bold text-[#61210F]/60 uppercase tracking-widest">
                  Security Audit Trail
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <AuditRow
                  label="Profile Created"
                  date={user.createdAt}
                  actor={user.createdBy?.name || "System Seed"}
                  email={user.createdBy?.email}
                />
                <div className="h-px bg-[#61210F]/5 ml-8" />
                <AuditRow
                  label="Last Modification"
                  date={user.updatedAt}
                  actor={user.updatedBy?.name || "Not available"}
                  email={user.updatedBy?.email}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const InfoBlock = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-[#61210F]/40 uppercase tracking-[0.15em] flex items-center gap-1.5">
      <Icon size={12} /> {label}
    </p>
    <p className="text-sm font-bold text-[#61210F] break-all">{value || "—"}</p>
  </div>
);

const AuditRow = ({ label, date, actor, email }) => {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <div className="w-2 h-2 rounded-full bg-[#EDAE49]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#61210F]">{label}</p>
        <p className="text-xs text-[#61210F]/60 mt-0.5">{fmt(date)}</p>
        <div className="mt-2 flex items-center gap-2 bg-[#F9EDCC]/30 w-fit px-3 py-1.5 rounded-lg border border-[#61210F]/5">
          <div className="w-5 h-5 rounded-full bg-[#61210F] text-[#F9EDCC] flex items-center justify-center text-[10px] font-bold">
            {actor.charAt(0)}
          </div>
          <div className="text-[11px]">
            <span className="font-bold text-[#61210F]">{actor}</span>
            {email && (
              <span className="text-[#61210F]/50 ml-1 hidden sm:inline">
                • {email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
