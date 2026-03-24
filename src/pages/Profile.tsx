import { useState, useEffect } from "react";
import { 
  User, Mail, Calendar, MapPin, Phone, Award, School, Shield, Edit, Save, X, Camera, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { usersAPI } from "@/lib/supabaseAPI"; // ✅ Updated import

// ALL YOUR EXISTING CODE STAYS THE SAME

interface ProfileProps {
  lang: Language;
}

const Profile = ({ lang }: ProfileProps) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+91 98765 43210",
    district: user?.district || "Pune",
    block: user?.block || "Haveli",
    school: user?.school || "ZP Primary School",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const getRoleBadge = () => {
    if (!user?.role) return null;
    
    const roleConfig = {
      state: { label: "State Officer", color: "bg-purple-100 text-purple-700" },
      deo: { label: "District Education Officer", color: "bg-blue-100 text-blue-700" },
      beo: { label: "Block Education Officer", color: "bg-green-100 text-green-700" },
      principal: { label: "Principal", color: "bg-amber-100 text-amber-700" },
    };
    
    const config = roleConfig[user.role];
    return (
      <Badge className={cn(config.color, "border-0")}>
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {t.myProfile}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Manage your account information" : "तुमची खाते माहिती व्यवस्थापित करा"}
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            {t.editProfile}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {t.saveChanges}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
              <X className="w-4 h-4" />
              {t.cancel}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                  <AvatarFallback className="text-3xl sm:text-4xl bg-primary/10">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 text-center sm:text-left">
                {getRoleBadge()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">{t.fullName}</Label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium mt-1">{formData.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">{t.emailAddress}</Label>
                  {isEditing ? (
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled
                    />
                  ) : (
                    <p className="text-lg font-medium mt-1">{formData.email}</p>
                  )}
                  {!isEditing && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t.verified}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">{lang === "en" ? "Phone" : "फोन"}</Label>
                  {isEditing ? (
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium mt-1">{formData.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">{t.district}</Label>
                  {isEditing ? (
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium mt-1">{formData.district}</p>
                  )}
                </div>
                {user?.role !== 'state' && (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">{lang === "en" ? "Block" : "ब्लॉक"}</Label>
                      {isEditing ? (
                        <Input
                          name="block"
                          value={formData.block}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-lg font-medium mt-1">{formData.block}</p>
                      )}
                    </div>
                    {user?.role === 'principal' && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{lang === "en" ? "School" : "शाळा"}</Label>
                        {isEditing ? (
                          <Input
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-lg font-medium mt-1">{formData.school}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{t.memberSince}: January 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for additional info */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="activities">{t.activities}</TabsTrigger>
          <TabsTrigger value="badges">{lang === "en" ? "Badges" : "बॅज"}</TabsTrigger>
          <TabsTrigger value="settings">{t.settings}</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lang === "en" ? "Recent Activities" : "अलीकडील उपक्रम"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tree Plantation Drive</p>
                      <p className="text-xs text-muted-foreground">March {i}, 2024</p>
                    </div>
                    <Badge variant="outline">+50 pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lang === "en" ? "Earned Badges" : "मिळालेले बॅज"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-xs font-medium">Eco Warrior</p>
                    <p className="text-xs text-muted-foreground">Level {i}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.changePassword}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t.currentPassword}</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>
                <div>
                  <Label>{t.newPassword}</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>
                <div>
                  <Label>{t.confirmNewPassword}</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>
                <Button className="w-full sm:w-auto">
                  {t.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;