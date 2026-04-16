import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Activity, 
  Save, 
  Loader2 
} from "lucide-react";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const loadUser = async () => {
      try {
        const user = await userService.getUserById(id);
        setForm({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          status: user.status,
        });
      } catch (err) {
        toast.error("Failed to load user");
        navigate("/users");
      } finally {
        setFetching(false);
      }
    };
    loadUser();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      if (isAdmin) {
        payload.role = form.role;
        payload.status = form.status;
      }

      if (isEdit) {
        await userService.updateUser(id, payload);
        toast.success("User updated successfully");
        navigate(`/users/${id}`);
      } else {
        const newUser = await userService.createUser(payload);
        toast.success("User created successfully");
        navigate(newUser?._id ? `/users/${newUser._id}` : "/users");
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach((e) => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.message || "Failed to save user");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#61210F] mx-auto mb-4" />
        <p className="text-[#61210F]/60 font-medium">Fetching user details...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(isEdit ? `/users/${id}` : "/users")}
            className="flex items-center gap-2 text-sm font-bold text-[#61210F]/60 hover:text-[#61210F] transition-colors group mb-4"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to {isEdit ? 'Profile' : 'Directory'}
          </button>
          <h2 className="text-3xl font-bold text-[#61210F] tracking-tight">
            {isEdit ? "Edit Profile" : "Create New User"}
          </h2>
          <p className="text-[#61210F]/60 text-sm mt-1">
            {isEdit ? `Update details for ${form.name}` : "Invite a new member to the management platform."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#61210F]/10 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 gap-6">
                <FormInput
                  label="Full Name"
                  id="name"
                  name="name"
                  icon={User}
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />

                <FormInput
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                />

                <FormInput
                  label={isEdit ? "New Password" : "Password"}
                  id="password"
                  name="password"
                  type="password"
                  icon={Lock}
                  value={form.password}
                  onChange={handleChange}
                  required={!isEdit}
                  minLength={6}
                  placeholder={isEdit ? "Leave blank to keep current" : "Minimum 6 characters"}
                />
              </div>

              {/* Administrative Controls Section */}
              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-[#61210F]/10">
                  <h3 className="text-[11px] font-bold text-[#61210F]/40 uppercase tracking-[0.2em] mb-4">
                    Administrative Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#61210F]/60 uppercase tracking-widest ml-1">
                        System Role
                      </label>
                      <div className="relative">
                        <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61210F]/30" />
                        <select
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9EDCC]/10 border border-[#61210F]/10 rounded-xl text-sm font-bold text-[#61210F] focus:ring-2 focus:ring-[#EDAE49] outline-none appearance-none"
                        >
                          <option value="user">Standard User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#61210F]/60 uppercase tracking-widest ml-1">
                        Account Status
                      </label>
                      <div className="relative">
                        <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#61210F]/30" />
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9EDCC]/10 border border-[#61210F]/10 rounded-xl text-sm font-bold text-[#61210F] focus:ring-2 focus:ring-[#EDAE49] outline-none appearance-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-[#61210F]/5">
              <button
                type="button"
                className="px-6 py-2.5 cursor-pointer text-sm font-bold text-[#61210F]/60 hover:text-[#61210F] transition-colors"
                onClick={() => navigate(isEdit ? `/users/${id}` : "/users")}
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center cursor-pointer gap-2 px-8 py-2.5 bg-[#EA2B1F] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isEdit ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

// Internal Input Component for cleaner form code
const FormInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-[#61210F]/60 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61210F]/30" />
      <input
        {...props}
        className="w-full pl-11 pr-4 py-3 bg-[#F9EDCC]/30 border border-[#61210F]/10 rounded-xl text-sm text-[#61210F] font-medium placeholder:text-[#61210F]/30 focus:outline-none focus:ring-2 focus:ring-[#EDAE49] transition-all"
      />
    </div>
  </div>
);

export default UserForm;