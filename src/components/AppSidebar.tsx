import { NavLink } from "./NavLink";
import { 
  LayoutDashboard, 
  School, 
  ClipboardList, 
  LineChart,
  Award,
  Leaf,
  BarChart3,
  Users,
  BookOpen // Add this icon
} from "lucide-react";
import { translations, Language } from "@/lib/translations";

interface AppSidebarProps {
  lang: Language;
}

const AppSidebar = ({ lang }: AppSidebarProps) => {
  const t = translations[lang];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1a3b2e] text-white flex flex-col border-r border-[#2a4a3e]">
      {/* Header with EcoTrack Maharashtra */}
      <div className="p-5 border-b border-[#2a4a3e]">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white tracking-tight">EcoTrack</span>
          <span className="text-sm text-white/70 font-medium mt-0.5">Maharashtra</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {/* Dashboard */}
        <div className="mb-4">
          <NavLink
            href="/"
            icon={LayoutDashboard}
            label={t.dashboard}
          />
        </div>

        {/* Government Resolutions - New Section */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 mb-2">
            GOVERNMENT
          </h4>
          <div className="space-y-1">
            <NavLink
              href="/resolutions"
              icon={BookOpen}
              label="Govt. Resolutions"
            />
          </div>
        </div>

        {/* School Portal Section */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 mb-2">
            {t.schoolPortalSection}
          </h4>
          <div className="space-y-1">
            <NavLink
              href="/school-portal"
              icon={School}
              label={t.schoolPortal}
            />
            <NavLink
              href="/activity-logger"
              icon={ClipboardList}
              label={t.activityLogger}
            />
            <NavLink
              href="/monitor"
              icon={LineChart}
              label={t.beoDeoMonitor}
            />
            <NavLink
              href="/recognition"
              icon={Award}
              label={t.recognition}
            />
          </div>
        </div>

        {/* Eco-Passports Section */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 mb-2">
            {t.ecoPassportsSection}
          </h4>
          <div className="space-y-1">
            <NavLink
              href="/eco-passports"
              icon={Leaf}
              label={t.ecoPassports}
            />
            <NavLink
              href="/analytics"
              icon={BarChart3}
              label={t.analytics}
            />
            <NavLink
              href="/community"
              icon={Users}
              label={t.community}
            />
          </div>
        </div>
      </nav>

      {/* Footer with version */}
      <div className="p-4 border-t border-[#2a4a3e]">
        <p className="text-xs text-white/40">© 2024 EcoTrack v1.0</p>
      </div>
    </aside>
  );
};

export default AppSidebar;