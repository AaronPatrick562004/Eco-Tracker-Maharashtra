import { useState, useEffect } from "react";
import { Search, Plus, Filter, MapPin, Phone, Mail, Users, CheckCircle, AlertTriangle, XCircle, School, ChevronRight, Edit, Trash2, Download, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { schoolsAPI } from "@/lib/api";

interface School {
  id: string;
  name: string;
  udise: string;
  district: string;
  block: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
  students_count: number;
  status: "active" | "pending" | "inactive";
  compliance: "green" | "amber" | "red";
}

const statusConfig = {
  active: { label: "Active", className: "bg-eco-green-light text-eco-green" },
  pending: { label: "Pending", className: "bg-eco-amber-light text-eco-amber" },
  inactive: { label: "Inactive", className: "bg-eco-red-light text-eco-red" },
};

const complianceIcon = {
  green: <CheckCircle className="w-4 h-4 text-eco-green" />,
  amber: <AlertTriangle className="w-4 h-4 text-eco-amber" />,
  red: <XCircle className="w-4 h-4 text-eco-red" />,
};

interface Props {
  lang: Language;
}

const SchoolPortal = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  // Add School Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    udise: '',
    district: '',
    block: '',
    coordinator_name: '',
    coordinator_phone: '',
    coordinator_email: '',
    students_count: 0,
    status: 'active' as const,
    compliance: 'green' as const
  });

  // Fetch schools from backend
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schoolsAPI.getAll();
      setSchools(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase()) ||
      s.udise.includes(search)
  );

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

  // Handle Add School form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSchool(prev => ({
      ...prev,
      [name]: name === 'students_count' ? parseInt(value) || 0 : value
    }));
  };

  // Handle Add School submission
  const handleAddSchool = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!newSchool.name || !newSchool.udise || !newSchool.district || !newSchool.block) {
        throw new Error('Please fill in all required fields');
      }

      // Call API to create school
      const created = await schoolsAPI.create(newSchool);
      
      // Add new school to list
      setSchools(prev => [created, ...prev]);
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewSchool({
        name: '', udise: '', district: '', block: '', coordinator_name: '',
        coordinator_phone: '', coordinator_email: '', students_count: 0,
        status: 'active', compliance: 'green'
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete School
  const handleDeleteSchool = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    
    try {
      await schoolsAPI.delete(id);
      setSchools(prev => prev.filter(s => s.id !== id));
      if (selectedSchool?.id === id) {
        setSelectedSchool(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Mobile detail view
  if (isMobile && showMobileDetail && selectedSchool) {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>Back to list</span>
        </button>

        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-lg">{selectedSchool.name}</h3>
            <div className="flex items-center gap-2">
              {complianceIcon[selectedSchool.compliance]}
            </div>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground">{selectedSchool.block}</p>
                <p className="text-muted-foreground text-xs">{selectedSchool.district}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">{selectedSchool.coordinator_name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">{selectedSchool.coordinator_phone}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground break-all">{selectedSchool.coordinator_email}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">UDISE Code</p>
                <p className="text-sm font-mono text-foreground">{selectedSchool.udise}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-sm text-foreground">{selectedSchool.students_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1", statusConfig[selectedSchool.status].className)}>
                  {statusConfig[selectedSchool.status].label}
                </span>
              </div>
            </div>

            {/* Mobile action buttons - Role Based */}
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
              
              {/* Principal can edit their school */}
              {user?.role === 'principal' && selectedSchool.name === user?.school && (
                <Button className="w-full bg-blue-600">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit School Details
                </Button>
              )}
              
              {/* BEO/DEO/State can verify */}
              {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                <Button variant="outline" className="w-full border-green-600 text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify School
                </Button>
              )}
              
              {/* Only State can delete */}
              {user?.role === 'state' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleDeleteSchool(selectedSchool.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete School
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t.schoolPortal}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Manage school registrations and coordinator details" : "शाळा नोंदणी आणि समन्वयक तपशील व्यवस्थापित करा"}
          </p>
        </div>
        
        {/* Only State Officer can add schools */}
        {user?.role === 'state' && (
          <Button 
            className="gap-2 gradient-primary text-primary-foreground border-0 w-full sm:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            {lang === "en" ? "Add School" : "शाळा जोडा"}
          </Button>
        )}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New School</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newSchool.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., ZP School, Shirdi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">UDISE Code *</label>
                <input
                  type="text"
                  name="udise"
                  value={newSchool.udise}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 27240100101"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  value={newSchool.district}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Pune"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Block *</label>
                <input
                  type="text"
                  name="block"
                  value={newSchool.block}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Haveli"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Coordinator Name</label>
                <input
                  type="text"
                  name="coordinator_name"
                  value={newSchool.coordinator_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Mr. Patil S.R."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Coordinator Phone</label>
                <input
                  type="text"
                  name="coordinator_phone"
                  value={newSchool.coordinator_phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., +91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Coordinator Email</label>
                <input
                  type="email"
                  name="coordinator_email"
                  value={newSchool.coordinator_email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., school@edu.mh.in"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Students Count</label>
                <input
                  type="number"
                  name="students_count"
                  value={newSchool.students_count}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={newSchool.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Compliance</label>
                <select
                  name="compliance"
                  value={newSchool.compliance}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="red">Red</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAddSchool}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add School'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row - using real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: lang === "en" ? "Total Schools" : "एकूण शाळा", value: schools.length.toString(), icon: "🏫" },
          { label: lang === "en" ? "Active" : "सक्रिय", value: schools.filter(s => s.status === 'active').length.toString(), icon: "✅" },
          { label: lang === "en" ? "Pending" : "प्रलंबित", value: schools.filter(s => s.status === 'pending').length.toString(), icon: "⏳" },
          { label: lang === "en" ? "Inactive" : "निष्क्रिय", value: schools.filter(s => s.status === 'inactive').length.toString(), icon: "⚠️" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border shadow-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">{stat.icon}</span>
            <div>
              <p className="text-base sm:text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search by school name, UDISE code..." : "शाळेचे नाव, UDISE कोड द्वारे शोधा..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4" />
          {lang === "en" ? "Filter" : "फिल्टर"}
        </Button>
      </div>

      {/* Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className={cn(
          "lg:col-span-2 bg-card rounded-xl border border-border shadow-card overflow-hidden",
          isMobile && showMobileDetail ? "hidden" : "block"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm">
                    {lang === "en" ? "School" : "शाळा"}
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                    UDISE
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                    {lang === "en" ? "District" : "जिल्हा"}
                  </th>
                  <th className="text-center px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                    {lang === "en" ? "Students" : "विद्यार्थी"}
                  </th>
                  <th className="text-center px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm">
                    {lang === "en" ? "Status" : "स्थिती"}
                  </th>
                  <th className="text-center px-3 sm:px-4 py-3 font-medium text-muted-foreground text-xs sm:text-sm">
                    {lang === "en" ? "Eco" : "इको"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school) => (
                  <tr
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className={cn(
                      "border-t border-border cursor-pointer transition-colors",
                      selectedSchool?.id === school.id ? "bg-accent" : "hover:bg-muted/30"
                    )}
                  >
                    <td className="px-3 sm:px-4 py-3 font-medium text-foreground text-xs sm:text-sm">
                      {school.name}
                      {isMobile && (
                        <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                          {school.udise}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                      {school.udise}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {school.district}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center text-foreground text-xs hidden sm:table-cell">
                      {school.students_count}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusConfig[school.status].className)}>
                        {statusConfig[school.status].label}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 flex justify-center">
                      {complianceIcon[school.compliance]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground font-medium">
                  {lang === "en" ? "No schools found" : "कोणत्याही शाळा आढळल्या नाहीत"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel - Desktop */}
        <div className={cn(
          "bg-card rounded-xl border border-border shadow-card p-5",
          isMobile ? "hidden" : "block"
        )}>
          {selectedSchool ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-lg">{selectedSchool.name}</h3>
                <div>{complianceIcon[selectedSchool.compliance]}</div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{selectedSchool.block}, {selectedSchool.district}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{selectedSchool.coordinator_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{selectedSchool.coordinator_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{selectedSchool.coordinator_email}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">UDISE Code</span>
                  <span className="font-mono text-foreground">{selectedSchool.udise}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Students</span>
                  <span className="text-foreground">{selectedSchool.students_count}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusConfig[selectedSchool.status].className)}>
                    {statusConfig[selectedSchool.status].label}
                  </span>
                </div>
              </div>

              {/* Desktop action buttons - Role Based */}
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
                
                {/* Principal can edit their school */}
                {user?.role === 'principal' && selectedSchool.name === user?.school && (
                  <Button className="w-full bg-blue-600">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit School Details
                  </Button>
                )}
                
                {/* BEO/DEO/State can verify */}
                {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                  <Button variant="outline" className="w-full border-green-600 text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify School
                  </Button>
                )}
                
                {/* Only State can delete */}
                {user?.role === 'state' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleDeleteSchool(selectedSchool.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete School
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-20">
              {lang === "en" ? "Select a school to view details" : "तपशील पाहण्यासाठी शाळा निवडा"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolPortal;