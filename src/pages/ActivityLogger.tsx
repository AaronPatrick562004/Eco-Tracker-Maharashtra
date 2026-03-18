import { useState } from "react";
import { Camera, MapPin, Calendar, Upload, TreePine, Droplets, Recycle, Wind, Sun, Plus, Filter, X, CheckCircle, AlertCircle, Clock, Download, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";

const activityTypes = [
  { id: "plantation", icon: TreePine, label: "Tree Plantation", labelMr: "वृक्षारोपण", color: "bg-eco-green-light text-eco-green" },
  { id: "water", icon: Droplets, label: "Water Conservation", labelMr: "जलसंधारण", color: "bg-eco-sky-light text-eco-sky" },
  { id: "waste", icon: Recycle, label: "Waste Management", labelMr: "कचरा व्यवस्थापन", color: "bg-eco-amber-light text-eco-amber" },
  { id: "air", icon: Wind, label: "Clean Air", labelMr: "स्वच्छ हवा", color: "bg-muted text-muted-foreground" },
  { id: "energy", icon: Sun, label: "Energy Saving", labelMr: "ऊर्जा बचत", color: "bg-eco-amber-light text-eco-amber" },
];

interface Activity {
  id: string;
  type: string;
  title: string;
  school: string;
  schoolId: string;
  date: string;
  students: number;
  photos: number;
  gps: string;
  status: "pending" | "approved" | "rejected";
}

const mockActivities: Activity[] = [
  { id: "1", type: "plantation", title: "Tree Plantation Drive — 50 saplings", school: "ZP School, Shirdi", schoolId: "1", date: "2025-02-23", students: 45, photos: 4, gps: "19.7668° N, 74.4782° E", status: "approved" },
  { id: "2", type: "water", title: "Rainwater Harvesting Workshop", school: "Municipal School, Pune", schoolId: "2", date: "2025-02-22", students: 60, photos: 3, gps: "18.5204° N, 73.8567° E", status: "pending" },
  { id: "3", type: "waste", title: "Plastic-Free Week Campaign", school: "Govt. HS, Nagpur", schoolId: "4", date: "2025-02-21", students: 120, photos: 6, gps: "21.1458° N, 79.0882° E", status: "approved" },
  { id: "4", type: "air", title: "Clean Air Survey & Monitoring", school: "KV, Thane", schoolId: "6", date: "2025-02-20", students: 30, photos: 2, gps: "19.2183° N, 72.9781° E", status: "approved" },
  { id: "5", type: "energy", title: "Solar Energy Awareness Day", school: "Navodaya, Satara", schoolId: "8", date: "2025-02-19", students: 80, photos: 5, gps: "17.6805° N, 73.9998° E", status: "rejected" },
  { id: "6", type: "plantation", title: "School Garden Project Phase 2", school: "Adarsh Vidyalaya, Kolhapur", schoolId: "5", date: "2025-02-18", students: 35, photos: 3, gps: "16.7050° N, 74.2433° E", status: "pending" },
];

const statusStyles = {
  pending: { 
    label: "Pending", 
    labelMr: "प्रलंबित",
    className: "bg-eco-amber-light text-eco-amber",
    icon: Clock
  },
  approved: { 
    label: "Approved", 
    labelMr: "मंजूर",
    className: "bg-eco-green-light text-eco-green",
    icon: CheckCircle
  },
  rejected: { 
    label: "Rejected", 
    labelMr: "नाकारले",
    className: "bg-eco-red-light text-eco-red",
    icon: AlertCircle
  },
};

interface Props {
  lang: Language;
}

const ActivityLogger = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter activities based on role
  const filtered = mockActivities
    .filter((a) => !activeType || a.type === activeType)
    .filter((a) => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.school.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((a) => {
      // Role-based filtering
      if (user?.role === 'principal') {
        return a.school === user.school; // Principal sees only their school
      }
      if (user?.role === 'beo' && user?.block) {
        return a.school.includes(user.block); // BEO sees their block
      }
      if (user?.role === 'deo' && user?.district) {
        return a.school.includes(user.district); // DEO sees their district
      }
      return true; // State sees all
    });

  const getStatusDisplay = (status: string) => {
    const config = statusStyles[status as keyof typeof statusStyles];
    const Icon = config.icon;
    return (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1", config.className)}>
        <Icon className="w-3 h-3" />
        {lang === "en" ? config.label : config.labelMr}
      </span>
    );
  };

  // Form for logging new activity (Only Principals see this)
  if (showForm && user?.role === 'principal') {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <button
          onClick={() => setShowForm(false)}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <X className="w-5 h-5" />
          <span>{lang === "en" ? "Back to activities" : "उपक्रमांकडे परत"}</span>
        </button>

        <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">
            {lang === "en" ? "Log New Activity" : "नवीन उपक्रम नोंदवा"}
          </h3>
          
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {lang === "en" ? "Activity Type" : "उपक्रमाचा प्रकार"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors hover:bg-muted"
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-xs">{lang === "en" ? type.label : type.labelMr}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {lang === "en" ? "Activity Title" : "उपक्रमाचे शीर्षक"}
              </label>
              <Input
                placeholder={lang === "en" ? "e.g., Tree Plantation Drive" : "उदा., वृक्षारोपण मोहीम"}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  {lang === "en" ? "Date" : "तारीख"}
                </label>
                <Input type="date" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  {lang === "en" ? "Number of Students" : "विद्यार्थी संख्या"}
                </label>
                <Input type="number" placeholder="e.g., 50" className="w-full" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {lang === "en" ? "Location" : "स्थान"}
              </label>
              <Input
                placeholder={lang === "en" ? "School campus or specific location" : "शाळा परिसर किंवा विशिष्ट स्थान"}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {lang === "en" ? "GPS Coordinates" : "GPS निर्देशांक"}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={lang === "en" ? "Auto-detected from your device" : "तुमच्या डिव्हाइसवरून आपोआप मिळाले"}
                  className="pl-9 w-full"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {lang === "en" ? "Upload Photos" : "फोटो अपलोड करा"}
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-foreground mb-1">
                  {lang === "en" ? "Click to upload or drag and drop" : "अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग आणि ड्रॉप करा"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "en" ? "PNG, JPG up to 10MB" : "PNG, JPG 10MB पर्यंत"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                {lang === "en" ? "Submit Activity" : "उपक्रम सबमिट करा"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {lang === "en" ? "Cancel" : "रद्द करा"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "en" ? "Activity Logger" : "उपक्रम नोंदणी"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Log and track environmental activities with evidence" : "पुराव्यासह पर्यावरणीय उपक्रम नोंदवा आणि ट्रॅक करा"}
          </p>
        </div>
        
        {/* Role-based header buttons */}
        <div className="flex gap-2">
          {/* ✅ PRINCIPAL sees Log Activity button */}
          {user?.role === 'principal' && (
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4" />
              {lang === "en" ? "Log Activity" : "उपक्रम नोंदवा"}
            </Button>
          )}
          
          {/* ✅ DEO/STATE see Export button */}
          {(user?.role === 'deo' || user?.role === 'state') && (
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {lang === "en" ? "Export" : "निर्यात करा"}
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "en" ? "Search activities..." : "उपक्रम शोधा..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button 
          variant="outline" 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          {lang === "en" ? "Filter" : "फिल्टर"}
        </Button>
      </div>

      {/* Activity Type Filters */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveType(null)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border whitespace-nowrap",
              !activeType ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"
            )}
          >
            {lang === "en" ? "All Activities" : "सर्व उपक्रम"}
          </button>
          {activityTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id === activeType ? null : t.id)}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border whitespace-nowrap",
                activeType === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              <t.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{lang === "en" ? t.label : t.labelMr}</span>
              <span className="sm:hidden">{lang === "en" ? t.label.split(' ')[0] : t.labelMr.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((activity) => {
            const typeInfo = activityTypes.find((t) => t.id === activity.type);
            const TypeIcon = typeInfo?.icon || TreePine;
            return (
              <div
                key={activity.id}
                className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 hover:shadow-elevated transition-shadow"
              >
                {/* Icon */}
                <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0", typeInfo?.color)}>
                  <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">{activity.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{activity.school}</p>
                    </div>
                    <div className="sm:ml-2">
                      {getStatusDisplay(activity.status)}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{activity.date}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{activity.gps}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 shrink-0" />
                      {activity.photos} {lang === "en" ? "photos" : "फोटो"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">👥</span>
                      {activity.students} {lang === "en" ? "students" : "विद्यार्थी"}
                    </span>
                  </div>

                  {/* Action Buttons - Role Based */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* View button - Everyone */}
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>

                    {/* ✅ PRINCIPAL can edit THEIR pending activities */}
                    {user?.role === 'principal' && 
                     activity.status === 'pending' && 
                     activity.school === user?.school && (
                      <Button size="sm" variant="outline" className="text-blue-600">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}

                    {/* ✅ BEO/DEO/STATE can approve/reject pending activities */}
                    {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && 
                     activity.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {/* ✅ BEO/DEO/STATE can verify photos */}
                    {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                      <Button size="sm" variant="outline">
                        <Camera className="w-4 h-4 mr-1" />
                        Verify Photos
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">
              {lang === "en" ? "No activities found" : "कोणतेही उपक्रम आढळले नाहीत"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "en" ? "Try adjusting your filters" : "तुमचे फिल्टर समायोजित करून पहा"}
            </p>
          </div>
        )}
      </div>

      {/* Load More Button - Only on mobile */}
      {filtered.length > 5 && isMobile && (
        <Button variant="outline" className="w-full">
          {lang === "en" ? "Load More" : "अधिक लोड करा"}
        </Button>
      )}
    </div>
  );
};

export default ActivityLogger;