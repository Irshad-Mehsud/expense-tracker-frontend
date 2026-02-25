import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/income", label: "Income", icon: Wallet },
  { path: "/expenses", label: "Expenses", icon: CreditCard },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showNotification("success", "Logged out successfully");
    navigate("/login");
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="font-medium">{item.label}</span>}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-6 border-b",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold">ExpenseTracker</span>
        )}
      </div>

      {/* User Info */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-4 border-b",
          collapsed && "justify-center px-2"
        )}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.profilePicture} alt={user?.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border shadow"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-background border-r transition-all duration-300 ease-in-out sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-background border shadow-sm hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}