import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Lock, Edit3, X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const ROLE_THEME = {
  admin: "bg-[#EA2B1F] text-white",
  manager: "bg-[#EDAE49] text-[#61210F]",
  user: "bg-[#F9DF74] text-[#61210F]",
};

const MyProfile = () => {
  const { user, updateUserInContext } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;

      const updated = await userService.updateUser(user._id, payload);
      updateUserInContext(updated);
      toast.success("Profile updated successfully");
      setEditing(false);
      setForm({ ...form, password: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }) : "—";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#61210F] tracking-tight">Account Settings</h2>
            <p className="text-[#61210F]/60 text-sm mt-1">Manage your public profile and security preferences.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#61210F] text-[#F9EDCC] rounded-lg text-sm font-bold transition-all hover:bg-[#61210F]/90 active:scale-95 shadow-sm"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Avatar & Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#61210F]/10 rounded-2xl p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-[#61210F] text-[#F9EDCC] text-3xl font-bold flex items-center justify-center mx-auto mb-4 shadow-inner">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" title="Account Active" />
              </div>
              <h3 className="text-lg font-bold text-[#61210F]">{user?.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-[#61210F]/40 mb-4">{user?.role}</p>
              
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_THEME[user?.role] || ROLE_THEME.user}`}>
                <Shield size={12} /> {user?.role} Access
              </div>
            </div>
          </div>

          {/* Right: Detailed Info / Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#61210F]/10 rounded-2xl overflow-hidden">
              <div className="p-6">
                {!editing ? (
                  <div className="space-y-6">
                    <InfoRow icon={User} label="Full Name" value={user?.name} />
                    <InfoRow icon={Mail} label="Email Address" value={user?.email} isLocked />
                    <InfoRow icon={Calendar} label="Member Since" value={formatDate(user?.createdAt)} />
                    <div className="pt-4 mt-6 border-t border-[#61210F]/5">
                      <p className="text-[11px] font-bold text-[#61210F]/40 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={12} /> Security
                      </p>
                      <p className="text-xs text-[#61210F]/60 mt-1">Passwords are encrypted and never shown.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <CustomInput
                      label="Full Name"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    
                    <div className="opacity-60 cursor-not-allowed">
                      <CustomInput label="Email Address" value={user?.email} readOnly />
                      <p className="text-[10px] font-bold text-[#EA2B1F] mt-1 uppercase">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <CustomInput
                        label="New Password"
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                      />
                      <CustomInput
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[#61210F]/5">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="cursor-pointer px-4 py-2 text-sm font-bold text-[#61210F]/60 hover:text-[#61210F] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex cursor-pointer items-center gap-2 px-6 py-2 bg-[#EA2B1F] text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {loading ? "Saving..." : <><Check size={16} /> Save Changes</>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Sub-components for cleaner code
const InfoRow = ({ icon: Icon, label, value, isLocked }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#61210F]/5 text-[#61210F]/60 group-hover:text-[#61210F] transition-colors">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#61210F]/40 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-[#61210F]">{value}</p>
      </div>
    </div>
    {isLocked && <Lock size={14} className="text-[#61210F]/20" />}
  </div>
);

const CustomInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-[#61210F]/60 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2.5 bg-[#F9EDCC]/30 border border-[#61210F]/10 rounded-xl text-sm text-[#61210F] font-medium placeholder:text-[#61210F]/30 focus:outline-none focus:ring-2 focus:ring-[#EDAE49] focus:border-transparent transition-all"
    />
  </div>
);

export default MyProfile;