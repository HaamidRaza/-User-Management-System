import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { BoltIcon, MenuIcon, X } from "lucide-react";

// Using the palette for semantic role badges
const ROLE_THEME = {
  admin: "bg-[#EA2B1F] text-white", // Burnt Tangerine for high authority
  manager: "bg-[#EDAE49] text-[#61210F]", // Honey Bronze
  user: "bg-[#F9DF74] text-[#61210F]", // Jasmine
};

const Navbar = () => {
  const { user, logout, isAdminOrManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const isActive = (path) => location.pathname === path;
  const isPathActive = (path) => location.pathname.startsWith(path);

  // Nav link styles using Dark Walnut (#61210F) and Cornsilk (#F9EDCC)
  const navLinkClass = (active) =>
    `px-3 py-2 rounded-md text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#EDAE49] ${
      active
        ? "bg-[#61210F] text-[#F9EDCC] font-semibold"
        : "text-[#61210F]/70 font-medium hover:bg-[#61210F]/5 hover:text-[#61210F]"
    }`;

  const userRoleStr = user?.role?.toLowerCase() || "user";
  const badgeStyle = ROLE_THEME[userRoleStr] || ROLE_THEME.user;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#F9EDCC] border-b border-[#61210F]/10">
      {/* Left Section: Brand & Desktop Links */}
      <div className="flex items-center gap-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[#61210F] font-bold text-[16px] tracking-tight no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#EA2B1F] rounded-sm"
        >
          <span className="text-[#EA2B1F] flex items-center justify-center">
            <BoltIcon className="w-5 h-5" />
          </span>
          UserMS
        </Link>

        <ul className="hidden sm:flex items-center gap-1 list-none m-0 p-0">
          <li>
            <Link
              to="/dashboard"
              className={navLinkClass(isActive("/dashboard"))}
            >
              Dashboard
            </Link>
          </li>
          {isAdminOrManager && (
            <li>
              <Link
                to="/users"
                className={navLinkClass(isPathActive("/users"))}
              >
                Users
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/profile"
              className={navLinkClass(isActive("/profile"))}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Right Section: Profile & Actions */}
      <div className="hidden sm:flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[13px] font-bold text-[#61210F]">
              {user?.name || "User Name"}
            </span>
            <span
              className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeStyle}`}
            >
              {user?.role || "Guest"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#61210F] flex items-center justify-center text-[#F9EDCC] text-xs font-bold border border-[#61210F]/20">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>

        <div className="w-px h-6 bg-[#61210F]/10" aria-hidden="true" />

        <button
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded border-2 border-[#61210F] text-[#61210F] hover:bg-[#61210F] hover:text-[#F9EDCC] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#EA2B1F]"
        >
          Logout
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-md text-[#61210F] hover:bg-[#61210F]/5 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-[#F9EDCC] border-b border-[#61210F]/20 shadow-xl px-4 py-6 flex flex-col gap-3 z-50">
          <Link
            to="/dashboard"
            className={navLinkClass(isActive("/dashboard"))}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          {isAdminOrManager && (
            <Link
              to="/users"
              className={navLinkClass(isPathActive("/users"))}
              onClick={() => setMenuOpen(false)}
            >
              Users
            </Link>
          )}
          <Link
            to="/profile"
            className={navLinkClass(isActive("/profile"))}
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
          <div className="h-px bg-[#61210F]/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#61210F]">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase border-b-2 border-[#EA2B1F] text-[#61210F]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
