import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  ShieldCheck, 
  UserPlus, 
  UserCircle, 
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Layout from '../../components/layout/Layout';

const StatCard = ({ label, value, icon: Icon, color, link }) => (
  <Link 
    to={link || '#'} 
    className="group relative overflow-hidden bg-white border border-[#61210F]/10 p-5 rounded-xl transition-all duration-200 hover:shadow-md hover:border-[#61210F]/20"
  >
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#61210F]/50 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-[#61210F]">{value}</h4>
      </div>
      <div className={`p-2.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
    {/* Subtle indicator bar */}
    <div className="absolute bottom-0 left-0 h-1 w-full opacity-20" style={{ backgroundColor: color }} />
  </Link>
);

const ActionCard = ({ to, icon: Icon, title, description }) => (
  <Link 
    to={to} 
    className="flex items-start gap-4 p-4 bg-white border border-[#61210F]/10 rounded-xl transition-all duration-200 hover:bg-[#61210F]/2 hover:shadow-sm group"
  >
    <div className="mt-1 p-2 rounded-lg bg-[#61210F]/5 text-[#61210F] transition-colors group-hover:bg-[#61210F] group-hover:text-[#F9EDCC]">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-[#61210F]">{title}</h4>
      <p className="text-xs text-[#61210F]/60 mt-0.5 leading-relaxed">{description}</p>
    </div>
    <ArrowRight size={14} className="text-[#61210F]/30 mt-1 group-hover:translate-x-1 transition-transform" />
  </Link>
);

const Dashboard = () => {
  const { user, isAdmin, isAdminOrManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminOrManager) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const [all, active, inactive, admins, managers, users] = await Promise.all([
          userService.getUsers({ limit: 1 }),
          userService.getUsers({ status: 'active', limit: 1 }),
          userService.getUsers({ status: 'inactive', limit: 1 }),
          isAdmin ? userService.getUsers({ role: 'admin', limit: 1 }) : Promise.resolve({ pagination: { total: '-' } }),
          userService.getUsers({ role: 'manager', limit: 1 }),
          userService.getUsers({ role: 'user', limit: 1 }),
        ]);
        setStats({
          total: all.pagination.total,
          active: active.pagination.total,
          inactive: inactive.pagination.total,
          admins: admins.pagination.total,
          managers: managers.pagination.total,
          users: users.pagination.total,
        });
      } catch (_) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdminOrManager, isAdmin]);

  return (
    <Layout>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[#EA2B1F] mb-2">
          <LayoutDashboard size={16} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Overview</span>
        </div>
        <h2 className="text-3xl font-bold text-[#61210F] tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-[#61210F]/60 mt-1 text-sm">
          Everything looks good today. Here is what's happening with your users.
        </p>
      </header>

      {isAdminOrManager && (
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-[#61210F]/5 animate-pulse rounded-xl" />
              ))
            ) : stats && (
              <>
                <StatCard label="Total Users" value={stats.total} icon={Users} color="#61210F" link="/users" />
                <StatCard label="Active Now" value={stats.active} icon={UserCheck} color="#059669" link="/users?status=active" />
                <StatCard label="Inactive" value={stats.inactive} icon={UserMinus} color="#EA2B1F" link="/users?status=inactive" />
                {isAdmin && (
                  <StatCard label="Admins" value={stats.admins} icon={ShieldCheck} color="#61210F" link="/users?role=admin" />
                )}
                <StatCard label="Managers" value={stats.managers} icon={UserCircle} color="#EDAE49" link="/users?role=manager" />
                <StatCard label="Standard Users" value={stats.users} icon={Users} color="#61210F" link="/users?role=user" />
              </>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#61210F]/40 mb-4 flex items-center gap-2">
            Quick Actions
            <div className="h-px flex-1 bg-[#61210F]/10" />
          </h3>
          <div className="space-y-3">
            <ActionCard 
              to="/profile" 
              icon={UserCircle} 
              title="My Account" 
              description="Update your personal details, email, and security settings." 
            />
            {isAdminOrManager && (
              <ActionCard 
                to="/users" 
                icon={Users} 
                title="User Directory" 
                description="Browse, filter, and export the full list of registered users." 
              />
            )}
            {isAdmin && (
              <ActionCard 
                to="/users/new" 
                icon={UserPlus} 
                title="Onboard New User" 
                description="Invite a new member to the platform with specific roles." 
              />
            )}
          </div>
        </section>

        {!isAdminOrManager && (
          <section className="bg-[#61210F] rounded-2xl p-6 text-[#F9EDCC] relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">System Notice</h3>
                <p className="text-[#F9EDCC]/70 text-sm leading-relaxed mb-6">
                  You are currently logged in as a Standard User. If you need elevated permissions to manage other team members, please contact your administrator.
                </p>
                <Link to="/profile" className="inline-flex items-center gap-2 bg-[#EA2B1F] px-4 py-2 rounded-lg text-sm font-bold transition-transform hover:scale-105 active:scale-95">
                  View My Profile <ArrowRight size={16} />
                </Link>
             </div>
             {/* Abstract background shape */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;