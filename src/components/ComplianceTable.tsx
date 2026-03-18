import { useState } from "react";
import { Filter, Search, MoreVertical, Download, Eye } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComplianceTableProps {
  lang: Language;
  searchQuery?: string;
}

const ComplianceTable = ({ lang, searchQuery = "" }: ComplianceTableProps) => {
  const t = translations[lang];
  const isMobile = useIsMobile();

  // Mock data
  const schools = [
    { id: 1, name: t.zpShirdi, district: t.pune, block: "Shirur", activities: 3, compliance: "Green", status: "compliant" },
    { id: 2, name: "ZP High School Rahuri", district: t.ahmednagar, block: "Rahuri", activities: 2, compliance: "Amber", status: "partial" },
    { id: 3, name: "ZP School Kopargaon", district: t.ahmednagar, block: "Kopargaon", activities: 0, compliance: "Red", status: "at-risk" },
    { id: 4, name: t.zpShirdi, district: t.pune, block: "Shirur", activities: 4, compliance: "Green", status: "compliant" },
    { id: 5, name: "ZP School Shrirampur", district: t.ahmednagar, block: "Shrirampur", activities: 1, compliance: "Amber", status: "partial" },
    { id: 6, name: t.zpWashim, district: t.washim, block: "Washim", activities: 0, compliance: "Red", status: "at-risk" },
    { id: 7, name: "ZP School Shevgaon", district: t.ahmednagar, block: "Shevgaon", activities: 2, compliance: "Amber", status: "partial" },
    { id: 8, name: t.govtNagpur, district: t.nagpur, block: "Nagpur", activities: 3, compliance: "Green", status: "compliant" },
  ];

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (compliance: string) => {
    switch(compliance) {
      case "Green": return "bg-green-500";
      case "Amber": return "bg-amber-500";
      case "Red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (compliance: string) => {
    switch(compliance) {
      case "Green": return t.compliant;
      case "Amber": return t.atRisk; // Using atRisk for Amber
      case "Red": return t.nonCompliant;
      default: return compliance;
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t.complianceStatus}</h3>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {filteredSchools.slice(0, 5).map((school) => (
            <div key={school.id} className="border border-border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{school.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {school.district} • {school.block}
                  </p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(school.compliance)}`} />
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {school.activities} {t.activities}
                </span>
                <span className={`text-xs font-medium ${
                  school.compliance === "Green" ? "text-green-600" :
                  school.compliance === "Amber" ? "text-amber-600" :
                  "text-red-600"
                }`}>
                  {getStatusText(school.compliance)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredSchools.length > 5 && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            {t.foundSchools.replace("{count}", filteredSchools.length.toString())}
          </p>
        )}

        {filteredSchools.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">
            {t.noSchoolsFound}
          </p>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t.complianceStatus}</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              className="pl-9 h-9 w-48 lg:w-64"
              value={searchQuery}
              readOnly
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="w-4 h-4 mr-2" />
            {t.complianceStatus}
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted/50 border-y border-border">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t.school}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t.district}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Block
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t.activities}
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t.status}
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-foreground">
                  {school.name}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {school.district}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {school.block}
                </td>
                <td className="py-3 px-4 text-sm text-center text-foreground">
                  {school.activities}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(school.compliance)}`} />
                    <span className={`text-sm font-medium ${
                      school.compliance === "Green" ? "text-green-600 dark:text-green-400" :
                      school.compliance === "Amber" ? "text-amber-600 dark:text-amber-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {getStatusText(school.compliance)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSchools.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t.noSchoolsFound}</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <p>{t.foundSchools.replace("{count}", filteredSchools.length.toString())}</p>
      </div>
    </div>
  );
};

export default ComplianceTable;