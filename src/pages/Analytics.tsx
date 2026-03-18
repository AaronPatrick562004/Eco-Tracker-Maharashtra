import { useState } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  School,
  Activity,
  Award,
  AlertTriangle,
  Users,
  Leaf,
  Droplets,
  Recycle,
  Sun,
  Wind
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";

interface DistrictData {
  name: string;
  schools: number;
  activities: number;
  compliance: number;
  students: number;
}

interface ActivityTypeData {
  type: string;
  icon: any;
  count: number;
  percentage: number;
  color: string;
}

const districtData: DistrictData[] = [
  { name: "Pune", schools: 8450, activities: 2847, compliance: 82, students: 285000 },
  { name: "Ahmednagar", schools: 6720, activities: 2134, compliance: 76, students: 198000 },
  { name: "Nagpur", schools: 5930, activities: 1956, compliance: 79, students: 175000 },
  { name: "Thane", schools: 5240, activities: 1689, compliance: 71, students: 162000 },
  { name: "Nashik", schools: 4890, activities: 1543, compliance: 68, students: 145000 },
  { name: "Aurangabad", schools: 4350, activities: 1321, compliance: 65, students: 128000 },
  { name: "Solapur", schools: 3980, activities: 1187, compliance: 62, students: 115000 },
  { name: "Kolhapur", schools: 3670, activities: 1098, compliance: 74, students: 108000 },
];

const activityTypeData: ActivityTypeData[] = [
  { type: "Tree Plantation", icon: Leaf, count: 5234, percentage: 42, color: "bg-green-500" },
  { type: "Water Conservation", icon: Droplets, count: 2341, percentage: 19, color: "bg-blue-500" },
  { type: "Waste Management", icon: Recycle, count: 1987, percentage: 16, color: "bg-amber-500" },
  { type: "Energy Saving", icon: Sun, count: 1562, percentage: 13, color: "bg-yellow-500" },
  { type: "Clean Air", icon: Wind, count: 1234, percentage: 10, color: "bg-purple-500" },
];

const monthlyData = [
  { month: "Jan", activities: 1245, compliance: 68 },
  { month: "Feb", activities: 1389, compliance: 71 },
  { month: "Mar", activities: 1567, compliance: 74 },
  { month: "Apr", activities: 1432, compliance: 72 },
  { month: "May", activities: 1289, compliance: 69 },
  { month: "Jun", activities: 1123, compliance: 65 },
  { month: "Jul", activities: 1456, compliance: 73 },
  { month: "Aug", activities: 1678, compliance: 76 },
  { month: "Sep", activities: 1823, compliance: 78 },
  { month: "Oct", activities: 1598, compliance: 75 },
  { month: "Nov", activities: 1345, compliance: 72 },
  { month: "Dec", activities: 1489, compliance: 74 },
];

interface Props {
  lang: Language;
}

const Analytics = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  // Calculate totals
  const totalSchools = districtData.reduce((sum, d) => sum + d.schools, 0);
  const totalActivities = districtData.reduce((sum, d) => sum + d.activities, 0);
  const totalStudents = districtData.reduce((sum, d) => sum + d.students, 0);
  const avgCompliance = Math.round(districtData.reduce((sum, d) => sum + d.compliance, 0) / districtData.length);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t.analytics}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Comprehensive insights and trends" : "सर्वसमावेशक अंतर्दृष्टी आणि ट्रेंड"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24 sm:w-28">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.registeredSchools}</p>
                <p className="text-xl font-bold">{totalSchools.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.activitiesThisMonth}</p>
                <p className="text-xl font-bold">{totalActivities.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Students" : "विद्यार्थी"}</p>
                <p className="text-xl font-bold">{(totalStudents / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.complianceRate}</p>
                <p className="text-xl font-bold">{avgCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activity by Type - Pie Chart Representation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {lang === "en" ? "Activities by Type" : "प्रकारानुसार उपक्रम"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityTypeData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{item.type}</span>
                      </div>
                      <span className="font-medium">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{item.percentage}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {lang === "en" ? "Monthly Trends" : "मासिक ट्रेंड"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1 sm:gap-2">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${month.activities / 20}px` }}
                    />
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${month.compliance}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground rotate-45 sm:rotate-0 origin-left">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> Activities
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full" /> Compliance %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District Performance Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">
            {lang === "en" ? "District Performance" : "जिल्हा कामगिरी"}
          </CardTitle>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={lang === "en" ? "All Districts" : "सर्व जिल्हे"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "en" ? "All Districts" : "सर्व जिल्हे"}</SelectItem>
              {districtData.map(d => (
                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    {lang === "en" ? "District" : "जिल्हा"}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    {t.registeredSchools}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    {t.activities}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    {t.complianceRate}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                    {lang === "en" ? "Students" : "विद्यार्थी"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {districtData
                  .filter(d => selectedDistrict === "all" || d.name === selectedDistrict)
                  .map((district) => (
                    <tr key={district.name} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{district.name}</td>
                      <td className="px-4 py-3 text-right">{district.schools.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{district.activities.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "font-medium",
                          district.compliance >= 80 ? "text-green-600" :
                          district.compliance >= 70 ? "text-amber-600" : "text-red-600"
                        )}>
                          {district.compliance}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {(district.students / 1000).toFixed(1)}K
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "en" ? "Top Performing Districts" : "शीर्ष कामगिरी करणारे जिल्हे"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {districtData
                .sort((a, b) => b.compliance - a.compliance)
                .slice(0, 5)
                .map((district, index) => (
                  <div key={district.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                      <span>{district.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">{district.compliance}%</span>
                      <span className="text-xs text-muted-foreground">
                        ({district.activities.toLocaleString()} {t.activities})
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "en" ? "Areas Needing Attention" : "लक्ष देण्याची गरज असलेले क्षेत्र"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {districtData
                .sort((a, b) => a.compliance - b.compliance)
                .slice(0, 5)
                .map((district, index) => (
                  <div key={district.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>{district.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">{district.compliance}%</span>
                      <span className="text-xs text-muted-foreground">
                        {district.activities.toLocaleString()} {t.activities}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;