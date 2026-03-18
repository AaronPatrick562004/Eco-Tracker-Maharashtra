import { useState } from "react";
import { 
  BarChart3, 
  Download, 
  Filter, 
  Search, 
  School, 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Flag,
  Bell,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";

interface SchoolCompliance {
  id: string;
  name: string;
  udise: string;
  district: string;
  block: string;
  activitiesThisMonth: number;
  lastActivity: string;
  compliance: "green" | "amber" | "red";
  students: number;
  coordinator: string;
  phone: string;
  flagged?: boolean;
}

interface BlockData {
  name: string;
  totalSchools: number;
  compliant: number;
  partial: number;
  atRisk: number;
  activities: number;
  district: string;
}

const mockBlocks: BlockData[] = [
  { name: "Shirur", totalSchools: 45, compliant: 28, partial: 12, atRisk: 5, activities: 67, district: "Pune" },
  { name: "Rahata", totalSchools: 38, compliant: 22, partial: 10, atRisk: 6, activities: 52, district: "Ahmednagar" },
  { name: "Kopargaon", totalSchools: 42, compliant: 25, partial: 12, atRisk: 5, activities: 48, district: "Ahmednagar" },
  { name: "Sangamner", totalSchools: 52, compliant: 31, partial: 15, atRisk: 6, activities: 73, district: "Ahmednagar" },
  { name: "Shrirampur", totalSchools: 40, compliant: 24, partial: 11, atRisk: 5, activities: 55, district: "Ahmednagar" },
  { name: "Nevasa", totalSchools: 44, compliant: 26, partial: 12, atRisk: 6, activities: 58, district: "Ahmednagar" },
  { name: "Haveli", totalSchools: 52, compliant: 34, partial: 12, atRisk: 6, activities: 82, district: "Pune" },
  { name: "Mulshi", totalSchools: 38, compliant: 24, partial: 9, atRisk: 5, activities: 61, district: "Pune" },
];

const mockSchools: SchoolCompliance[] = [
  {
    id: "1",
    name: "ZP Primary School, Shirdi",
    udise: "27240100101",
    district: "Ahmednagar",
    block: "Shirur",
    activitiesThisMonth: 3,
    lastActivity: "2024-03-15",
    compliance: "green",
    students: 320,
    coordinator: "Mr. Patil S.R.",
    phone: "+91 98765 43210",
  },
  {
    id: "2",
    name: "ZP High School, Rahuri",
    udise: "27240100202",
    district: "Ahmednagar",
    block: "Rahuri",
    activitiesThisMonth: 1,
    lastActivity: "2024-03-10",
    compliance: "amber",
    students: 580,
    coordinator: "Ms. Deshmukh A.V.",
    phone: "+91 98765 43211",
  },
  {
    id: "3",
    name: "ZP School, Kopargaon",
    udise: "27240100303",
    district: "Ahmednagar",
    block: "Kopargaon",
    activitiesThisMonth: 0,
    lastActivity: "2024-02-28",
    compliance: "red",
    students: 210,
    coordinator: "Mr. Jadhav R.K.",
    phone: "+91 98765 43212",
  },
  {
    id: "4",
    name: "ZP School, Sangamner",
    udise: "27240100404",
    district: "Ahmednagar",
    block: "Sangamner",
    activitiesThisMonth: 4,
    lastActivity: "2024-03-14",
    compliance: "green",
    students: 450,
    coordinator: "Ms. Kulkarni P.M.",
    phone: "+91 98765 43213",
  },
  {
    id: "5",
    name: "ZP School, Shrirampur",
    udise: "27240100505",
    district: "Ahmednagar",
    block: "Shrirampur",
    activitiesThisMonth: 2,
    lastActivity: "2024-03-12",
    compliance: "amber",
    students: 380,
    coordinator: "Mr. Shinde V.B.",
    phone: "+91 98765 43214",
  },
  {
    id: "6",
    name: "ZP School, Nevasa",
    udise: "27240100606",
    district: "Ahmednagar",
    block: "Nevasa",
    activitiesThisMonth: 0,
    lastActivity: "2024-02-25",
    compliance: "red",
    students: 290,
    coordinator: "Ms. More L.A.",
    phone: "+91 98765 43215",
  },
  {
    id: "7",
    name: "ZP School, Haveli",
    udise: "27250200707",
    district: "Pune",
    block: "Haveli",
    activitiesThisMonth: 5,
    lastActivity: "2024-03-16",
    compliance: "green",
    students: 520,
    coordinator: "Mr. Kulkarni P.M.",
    phone: "+91 98765 43216",
  },
  {
    id: "8",
    name: "ZP School, Mulshi",
    udise: "27250200808",
    district: "Pune",
    block: "Mulshi",
    activitiesThisMonth: 2,
    lastActivity: "2024-03-13",
    compliance: "amber",
    students: 340,
    coordinator: "Ms. Joshi A.V.",
    phone: "+91 98765 43217",
  },
];

const complianceConfig = {
  green: { 
    label: "Compliant", 
    labelMr: "अनुपालित",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: CheckCircle 
  },
  amber: { 
    label: "Partial", 
    labelMr: "आंशिक",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: AlertTriangle 
  },
  red: { 
    label: "At Risk", 
    labelMr: "धोक्यात",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle 
  },
};

interface Props {
  lang: Language;
}

const BEODEOMonitor = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolCompliance | null>(null);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
  const [flaggedSchools, setFlaggedSchools] = useState<string[]>([]);

  // Filter data based on user role
  const getFilteredBlocks = () => {
    if (user?.role === 'state') return mockBlocks;
    if (user?.role === 'deo' && user?.district) {
      return mockBlocks.filter(b => b.district === user.district);
    }
    if (user?.role === 'beo' && user?.block) {
      return mockBlocks.filter(b => b.name === user.block);
    }
    return []; // Principal sees no blocks
  };

  const getFilteredSchools = () => {
    let filtered = mockSchools;
    
    // Role-based filtering
    if (user?.role === 'principal' && user?.school) {
      filtered = filtered.filter(s => s.name === user.school);
    } else if (user?.role === 'beo' && user?.block) {
      filtered = filtered.filter(s => s.block === user.block);
    } else if (user?.role === 'deo' && user?.district) {
      filtered = filtered.filter(s => s.district === user.district);
    }
    
    // Apply search
    return filtered.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           school.udise.includes(searchQuery);
      const matchesBlock = selectedBlock === "all" || school.block === selectedBlock;
      return matchesSearch && matchesBlock;
    });
  };

  const filteredBlocks = getFilteredBlocks();
  const filteredSchools = getFilteredSchools();

  // Calculate overall stats
  const totalSchools = filteredSchools.length;
  const compliantSchools = filteredSchools.filter(s => s.compliance === "green").length;
  const partialSchools = filteredSchools.filter(s => s.compliance === "amber").length;
  const atRiskSchools = filteredSchools.filter(s => s.compliance === "red").length;
  const totalActivities = filteredSchools.reduce((sum, s) => sum + s.activitiesThisMonth, 0);
  
  const complianceRate = totalSchools > 0 ? Math.round((compliantSchools / totalSchools) * 100) : 0;

  const getComplianceBadge = (compliance: string) => {
    const config = complianceConfig[compliance as keyof typeof complianceConfig];
    const Icon = config.icon;
    return (
      <span className={cn("text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1", config.bg, config.color)}>
        <Icon className="w-3 h-3" />
        {lang === "en" ? config.label : config.labelMr}
      </span>
    );
  };

  const handleSchoolClick = (school: SchoolCompliance) => {
    setSelectedSchool(school);
    if (isMobile) {
      setShowSchoolDetail(true);
    }
  };

  const handleFlagSchool = (schoolId: string) => {
    setFlaggedSchools(prev => 
      prev.includes(schoolId) ? prev.filter(id => id !== schoolId) : [...prev, schoolId]
    );
  };

  const handleBackToList = () => {
    setShowSchoolDetail(false);
  };

  // Mobile school detail view
  if (isMobile && showSchoolDetail && selectedSchool) {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronDown className="w-5 h-5 rotate-90" />
          <span>{lang === "en" ? "Back to list" : "यादीकडे परत"}</span>
        </button>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{selectedSchool.name}</CardTitle>
              {getComplianceBadge(selectedSchool.compliance)}
            </div>
            <p className="text-sm text-muted-foreground">UDISE: {selectedSchool.udise}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t.activities}</p>
                <p className="text-xl font-bold">{selectedSchool.activitiesThisMonth}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Students</p>
                <p className="text-xl font-bold">{selectedSchool.students}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{selectedSchool.block}, {selectedSchool.district}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{lang === "en" ? "Last activity: " : "शेवटचा उपक्रम: "}{selectedSchool.lastActivity}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{selectedSchool.coordinator}</span>
              </div>
            </div>

            {/* Mobile action buttons - Role Based */}
            <div className="flex flex-col gap-2 mt-4">
              {/* View Report - Everyone */}
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                {lang === "en" ? "View Full Report" : "संपूर्ण अहवाल पहा"}
              </Button>

              {/* ✅ BEO/DEO/STATE can flag schools */}
              {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full",
                    flaggedSchools.includes(selectedSchool.id) 
                      ? "border-red-600 text-red-600" 
                      : "border-amber-600 text-amber-600"
                  )}
                  onClick={() => handleFlagSchool(selectedSchool.id)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {flaggedSchools.includes(selectedSchool.id) 
                    ? (lang === "en" ? "Remove Flag" : "ध्वज काढा")
                    : (lang === "en" ? "Flag for Review" : "पुनरावलोकनासाठी ध्वजांकित करा")}
                </Button>
              )}

              {/* ✅ DEO/STATE can send alerts */}
              {(user?.role === 'deo' || user?.role === 'state') && (
                <Button variant="outline" className="w-full border-red-600 text-red-600">
                  <Bell className="w-4 h-4 mr-2" />
                  {lang === "en" ? "Send Alert" : "सूचना पाठवा"}
                </Button>
              )}

              {/* ✅ STATE can generate report */}
              {user?.role === 'state' && (
                <Button variant="outline" className="w-full border-blue-600 text-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  {lang === "en" ? "Generate Report" : "अहवाल तयार करा"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t.beoDeoMonitor}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Monitor school compliance and activities" : "शाळांचे अनुपालन आणि उपक्रम मॉनिटर करा"}
          </p>
        </div>
        
        {/* Role-based header buttons */}
        <div className="flex gap-2">
          {/* ✅ DEO/STATE can export */}
          {(user?.role === 'deo' || user?.role === 'state') && (
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {lang === "en" ? "Export Report" : "अहवाल निर्यात करा"}
            </Button>
          )}
          
          {/* ✅ STATE can generate comprehensive report */}
          {user?.role === 'state' && (
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4" />
              {lang === "en" ? "State Report" : "राज्य अहवाल"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Filtered by role */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.registeredSchools}</p>
                <p className="text-xl font-bold">{totalSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.compliant}</p>
                <p className="text-xl font-bold">{compliantSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.atRisk}</p>
                <p className="text-xl font-bold">{partialSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.nonCompliant}</p>
                <p className="text-xl font-bold">{atRiskSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.activitiesThisMonth}</p>
                <p className="text-xl font-bold">{totalActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Rate Bar - Show for all except principal */}
      {user?.role !== 'principal' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {lang === "en" ? "Overall Compliance Rate" : "एकूण अनुपालन दर"}
                </p>
                <p className="text-2xl font-bold text-green-600">{complianceRate}%</p>
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${complianceRate}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> {t.compliant} ({compliantSchools})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" /> {t.atRisk} ({partialSchools})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" /> {t.nonCompliant} ({atRiskSchools})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs - Different tabs based on role */}
      <Tabs defaultValue={user?.role === 'principal' ? "schools" : "overview"} onValueChange={setSelectedTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            {/* Hide Block Overview for principals */}
            {user?.role !== 'principal' && (
              <TabsTrigger value="overview">{lang === "en" ? "Block Overview" : "ब्लॉक विहंगावलोकन"}</TabsTrigger>
            )}
            <TabsTrigger value="schools">{lang === "en" ? "School List" : "शाळा यादी"}</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={lang === "en" ? "Search schools..." : "शाळा शोधा..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Block Filter - Show for BEO/DEO/STATE */}
        {showFilters && user?.role !== 'principal' && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <label className="text-sm font-medium text-foreground block mb-2">
              {lang === "en" ? "Filter by Block" : "ब्लॉकनुसार फिल्टर करा"}
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full p-2 rounded-lg bg-card border border-border text-foreground"
            >
              <option value="all">{lang === "en" ? "All Blocks" : "सर्व ब्लॉक"}</option>
              {filteredBlocks.map(block => (
                <option key={block.name} value={block.name}>{block.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Overview Tab - Hide for principals */}
        {user?.role !== 'principal' && (
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => {
                const blockComplianceRate = block.totalSchools > 0 
                  ? Math.round((block.compliant / block.totalSchools) * 100) 
                  : 0;
                return (
                  <Card key={block.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{block.name}</CardTitle>
                      {user?.role === 'deo' && (
                        <p className="text-xs text-muted-foreground">{block.district}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.registeredSchools}</span>
                        <span className="font-medium">{block.totalSchools}</span>
                      </div>
                      
                      {/* Compliance bars */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">{t.compliant}</span>
                          <span>{block.compliant}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ width: `${(block.compliant / block.totalSchools) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-amber-600">{t.atRisk}</span>
                          <span>{block.partial}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500"
                            style={{ width: `${(block.partial / block.totalSchools) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-red-600">{t.nonCompliant}</span>
                          <span>{block.atRisk}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500"
                            style={{ width: `${(block.atRisk / block.totalSchools) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">{t.activitiesThisMonth}</span>
                        <span className="font-medium">{block.activities}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">{blockComplianceRate}% {t.complianceRate}</span>
                      </div>

                      {/* Action buttons for BEO/DEO/STATE */}
                      {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        )}

        {/* Schools List Tab */}
        <TabsContent value="schools">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {lang === "en" ? "School" : "शाळा"}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                      UDISE
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                      {t.district}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {t.activities}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                      {t.status}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      {lang === "en" ? "Actions" : "क्रिया"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr 
                      key={school.id} 
                      className={cn(
                        "border-t border-border hover:bg-muted/30 transition-colors cursor-pointer",
                        flaggedSchools.includes(school.id) && "bg-red-50 dark:bg-red-900/10"
                      )}
                      onClick={() => handleSchoolClick(school)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{school.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {school.udise}
                          </p>
                          {flaggedSchools.includes(school.id) && (
                            <span className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <Flag className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                        {school.udise}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {school.block}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-sm font-medium",
                          school.activitiesThisMonth >= 3 ? "text-green-600" :
                          school.activitiesThisMonth > 0 ? "text-amber-600" : "text-red-600"
                        )}>
                          {school.activitiesThisMonth}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {getComplianceBadge(school.compliance)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Flag button - BEO/DEO/STATE */}
                          {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-8 w-8 p-0",
                                flaggedSchools.includes(school.id) ? "text-red-600" : "text-muted-foreground"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFlagSchool(school.id);
                              }}
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSchools.length === 0 && (
                <div className="text-center py-12">
                  <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-foreground font-medium">
                    {lang === "en" ? "No schools found" : "कोणत्याही शाळा आढळल्या नाहीत"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BEODEOMonitor;