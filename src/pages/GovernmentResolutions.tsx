import { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Tag, 
  Search, 
  Filter,
  Eye,
  Bookmark,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";

interface Resolution {
  id: string;
  title: string;
  number: string;
  date: string;
  department: string;
  category: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  downloads: number;
  tags: string[];
  isNew?: boolean;
}

const mockResolutions: Resolution[] = [
  {
    id: "1",
    title: "Environmental Education Mandate for All Schools",
    number: "GR-2024-01-001",
    date: "2024-01-15",
    department: "Education Department",
    category: "Policy",
    description: "Mandatory implementation of environmental education programs in all government and private schools.",
    fileUrl: "#",
    fileSize: "2.4 MB",
    downloads: 1245,
    tags: ["mandatory", "education", "policy"],
    isNew: true
  },
  {
    id: "2",
    title: "Tree Plantation Drive Guidelines 2024",
    number: "GR-2024-02-045",
    date: "2024-02-10",
    department: "Forest Department",
    category: "Guidelines",
    description: "Standard operating procedures for conducting tree plantation drives in schools.",
    fileUrl: "#",
    fileSize: "1.8 MB",
    downloads: 892,
    tags: ["tree plantation", "guidelines"],
  },
  {
    id: "3",
    title: "Waste Management Rules for Educational Institutions",
    number: "GR-2024-03-078",
    date: "2024-03-05",
    department: "Environment Department",
    category: "Regulation",
    description: "New regulations for waste segregation, collection, and disposal in schools.",
    fileUrl: "#",
    fileSize: "3.1 MB",
    downloads: 567,
    tags: ["waste management", "regulation"],
  },
  {
    id: "4",
    title: "Recognition Scheme for Green Schools",
    number: "GR-2023-12-112",
    date: "2023-12-20",
    department: "Education Department",
    category: "Scheme",
    description: "Annual awards and recognition for schools demonstrating excellence in environmental initiatives.",
    fileUrl: "#",
    fileSize: "1.2 MB",
    downloads: 2103,
    tags: ["recognition", "awards", "scheme"],
  },
  {
    id: "5",
    title: "Water Conservation Guidelines for Schools",
    number: "GR-2024-01-089",
    date: "2024-01-28",
    department: "Water Resources Department",
    category: "Guidelines",
    description: "Guidelines for implementing rainwater harvesting and water conservation measures.",
    fileUrl: "#",
    fileSize: "2.2 MB",
    downloads: 756,
    tags: ["water", "conservation"],
  },
  {
    id: "6",
    title: "Eco Club Formation and Operation Guidelines",
    number: "GR-2023-11-234",
    date: "2023-11-15",
    department: "Education Department",
    category: "Guidelines",
    description: "Standard framework for establishing and managing Eco Clubs in schools.",
    fileUrl: "#",
    fileSize: "1.5 MB",
    downloads: 1890,
    tags: ["eco club", "guidelines"],
  },
];

const categories = ["All", "Policy", "Guidelines", "Regulation", "Scheme", "Circular"];

interface Props {
  lang: Language;
}

const GovernmentResolutions = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const filteredResolutions = mockResolutions.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "en" ? "Government Resolutions" : "सरकारी ठराव"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Official circulars and guidelines for schools" : "शाळांसाठी अधिकृत परिपत्रके आणि मार्गदर्शक तत्त्वे"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lang === "en" ? "Search resolutions..." : "ठराव शोधा..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-80"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Total GRs" : "एकूण ठराव"}</p>
                <p className="text-lg sm:text-xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Tag className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Categories" : "श्रेणी"}</p>
                <p className="text-lg sm:text-xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Download className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Downloads" : "डाउनलोड"}</p>
                <p className="text-lg sm:text-xl font-bold">7.4K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "This Month" : "या महिन्यात"}</p>
                <p className="text-lg sm:text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Resolutions List */}
      <div className="space-y-3">
        {filteredResolutions.map((resolution) => (
          <Card key={resolution.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="hidden sm:block">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{resolution.title}</h3>
                        {resolution.isNew && (
                          <Badge variant="default" className="bg-green-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{resolution.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(resolution.id)}
                      className={cn(
                        "shrink-0",
                        bookmarked.includes(resolution.id) && "text-yellow-500"
                      )}
                    >
                      <Bookmark className={cn(
                        "w-4 h-4",
                        bookmarked.includes(resolution.id) && "fill-current"
                      )} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      {resolution.number}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {resolution.date}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {resolution.department}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Download className="w-3 h-3" />
                      {resolution.downloads} downloads
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {resolution.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">{lang === "en" ? "Preview" : "पूर्वावलोकन"}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">{lang === "en" ? "Download" : "डाउनलोड"}</span>
                      <span className="text-xs ml-1">({resolution.fileSize})</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-2 ml-auto">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <Button variant="outline" className="w-full">
        {lang === "en" ? "Load More Resolutions" : "अधिक ठराव लोड करा"}
      </Button>
    </div>
  );
};

export default GovernmentResolutions;