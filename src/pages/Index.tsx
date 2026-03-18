import React, { useState, useEffect } from "react";
import { School, ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import ComplianceTable from "@/components/ComplianceTable";
import RecentActivities from "@/components/RecentActivities";
import DistrictMap from "@/components/DistrictMap";
import { translations, Language } from "@/lib/translations";

interface Props {
  lang: Language;
  searchQuery?: string;
}

const Index = ({ lang, searchQuery = "" }: Props) => {
  const t = translations[lang];
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if mobile based on window width
  const isMobile = windowWidth < 768;

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - Responsive padding */}
      <div className={`${isMobile ? 'p-3' : 'p-4 sm:p-6'} space-y-4 sm:space-y-6`}>
        
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold text-foreground`}>
            {t.dashboardTitle || 'Dashboard'}
          </h1>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
            {t.dashboardSubtitle || 'Environmental education tracking across Maharashtra'}
          </p>
        </div>

        {/* Metrics Cards - Always stack vertically on mobile */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {/* Card 1 */}
          <div className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.registeredSchools || 'Registered Schools'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">75,420</p>
                <p className="text-sm text-green-600 mt-1">+1,230 ↑</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <School className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.activitiesThisMonth || 'Activities This Month'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">12,847</p>
                <p className="text-sm text-green-600 mt-1">+18% ↑</p>
              </div>
              <div className="p-3 bg-sky-500/10 rounded-xl">
                <ClipboardList className="w-5 h-5 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.complianceRate || 'Compliance Rate'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">78.3%</p>
                <p className="text-sm text-green-600 mt-1">+2.1% ↑</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.schoolsAtRisk || 'Schools At Risk'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">4,312</p>
                <p className="text-sm text-green-600 mt-1">-540 ↑</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Section - Stack on mobile */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
          {/* Left Column - Compliance Table (takes 2/3 on desktop) */}
          <div className="sm:col-span-2">
            <ComplianceTable lang={lang} searchQuery={searchQuery} />
          </div>
          
          {/* Right Column - Recent Activities (takes 1/3 on desktop) */}
          <div className="sm:col-span-1">
            <RecentActivities lang={lang} />
          </div>
        </div>

        {/* Bottom Section - Stack on mobile */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
          {/* District Map */}
          <DistrictMap lang={lang} />
          
          {/* Rollout Progress */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
              {t.rolloutProgress || 'Rollout Progress'}
            </h3>
            <div className="space-y-4">
              {[
                { phase: t.phase1 || 'Phase 1 — Pilot (2 Districts)', progress: 100, status: t.complete || 'Complete' },
                { phase: t.phase2 || 'Phase 2 — Expand to 8 Districts', progress: 72, status: t.inProgress || 'In Progress' },
                { phase: t.phase3 || 'Phase 3 — 18 Districts', progress: 15, status: t.starting || 'Starting' },
                { phase: t.phase4 || 'Phase 4 — 30 Districts', progress: 0, status: t.planned || 'Planned' },
                { phase: t.phase5 || 'Phase 5 — Statewide (36 Districts)', progress: 0, status: t.planned || 'Planned' },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-medium text-foreground">{p.phase}</span>
                    <span className="text-muted-foreground text-xs">{p.status}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debug info - Remove after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 right-2 bg-black text-white text-xs p-2 rounded opacity-50">
            Width: {windowWidth}px | {isMobile ? 'Mobile' : 'Desktop'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;