import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-primary text-white font-medium shadow-sm" 
          : "text-white/80 hover:bg-primary hover:text-white hover:font-medium"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0",
        isActive ? "text-white" : "text-white/70"
      )} />
      <span className="text-sm">{label}</span>
    </Link>
  );
};