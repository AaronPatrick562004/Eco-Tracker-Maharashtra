import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

interface District {
  name: string;
  schools_count: number;
  compliance_rate: number;
}

interface Props {
  lang: Language;
}

const DistrictMap = ({ lang }: Props) => {
  const t = translations[lang];
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('districts')
        .select('name, schools_count, compliance_rate')
        .order('compliance_rate', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      setDistricts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching districts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('districts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'districts' },
        () => {
          fetchDistricts();
        }
      )
      .subscribe();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5">
        <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
          {lang === "en" ? "District Overview" : "जिल्हा विहंगावलोकन"}
        </h3>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5">
        <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
          {lang === "en" ? "District Overview" : "जिल्हा विहंगावलोकन"}
        </h3>
        <p className="text-red-600 text-center text-sm">Error loading districts</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5">
      <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
        {lang === "en" ? "District Overview" : "जिल्हा विहंगावलोकन"}
      </h3>
      
      {/* Map Placeholder */}
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
        <div className="text-center">
          <MapPin className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {lang === "en" ? "Map View Coming Soon" : "नकाशा दृश्य लवकरच येत आहे"}
          </p>
        </div>
      </div>

      {/* District Stats */}
      <div className="space-y-3">
        {districts.map((district) => (
          <div key={district.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{district.name}</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-green-600">{district.compliance_rate}%</span>
              <p className="text-xs text-muted-foreground">{district.schools_count.toLocaleString()} schools</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictMap;