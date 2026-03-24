// src/pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { translations, Language } from '@/lib/translations';
import { TrendingUp, Download, School, Activity, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface District {
  id: string;
  name: string;
  schools_count: number;
  activities_count: number;
  compliance_rate: number;
  students_count: number;
  blocks_count: number;
}

interface MonthlyTrend {
  id: string;
  month: string;
  month_num: number;
  activities_count: number;
  compliance_rate: number;
  year: number;
}

interface Props {
  lang: Language;
}

const Analytics = ({ lang }: Props) => {
  const t = translations[lang];
  
  const [districts, setDistricts] = useState<District[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStats, setTotalStats] = useState({ 
    schools: 0, 
    activities: 0, 
    students: 0, 
    compliance: 0 
  });

  useEffect(() => {
    fetchData();
    
    // Real-time subscriptions
    const districtsSubscription = supabase
      .channel('districts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'districts' },
        () => fetchData()
      )
      .subscribe();
    
    const trendsSubscription = supabase
      .channel('trends-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_trends' },
        () => fetchData()
      )
      .subscribe();
    
    return () => {
      districtsSubscription.unsubscribe();
      trendsSubscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch REAL districts data from database
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('*')
        .order('compliance_rate', { ascending: false });
      
      if (districtsError) throw districtsError;
      
      // Fetch REAL monthly trends from database
      const { data: trendsData, error: trendsError } = await supabase
        .from('monthly_trends')
        .select('*')
        .order('year', { ascending: true })
        .order('month_num', { ascending: true });
      
      if (trendsError) throw trendsError;
      
      setDistricts(districtsData || []);
      setMonthlyTrends(trendsData || []);
      
      // Calculate totals from districts data
      const totalSchools = districtsData?.reduce((sum, d) => sum + (d.schools_count || 0), 0) || 0;
      const totalActivities = districtsData?.reduce((sum, d) => sum + (d.activities_count || 0), 0) || 0;
      const totalStudents = districtsData?.reduce((sum, d) => sum + (d.students_count || 0), 0) || 0;
      const avgCompliance = districtsData?.length 
        ? districtsData.reduce((sum, d) => sum + (d.compliance_rate || 0), 0) / districtsData.length 
        : 0;
      
      setTotalStats({
        schools: totalSchools,
        activities: totalActivities,
        students: totalStudents,
        compliance: Math.round(avgCompliance * 10) / 10
      });
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={fetchData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights and trends</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Stats Cards - Using REAL data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <School className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Schools</p>
                <p className="text-xl font-bold">{totalStats.schools.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Activities</p>
                <p className="text-xl font-bold">{totalStats.activities.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-xl font-bold">{(totalStats.students / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compliance Rate</p>
                <p className="text-xl font-bold">{totalStats.compliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart - Using REAL data */}
      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1 sm:gap-2">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-green-500 rounded-t" 
                    style={{ height: `${Math.min(month.activities_count / 30, 200)}px` }} 
                  />
                  <div 
                    className="w-full bg-blue-500 rounded-t" 
                    style={{ height: `${month.compliance_rate}px` }} 
                  />
                  <span className="text-xs text-muted-foreground rotate-45 sm:rotate-0">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Activities
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Compliance %
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* District Performance Table - Using REAL data */}
      <Card>
        <CardHeader>
          <CardTitle>District Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3">District</th>
                  <th className="text-right px-4 py-3">Schools</th>
                  <th className="text-right px-4 py-3">Activities</th>
                  <th className="text-right px-4 py-3">Compliance</th>
                  <th className="text-right px-4 py-3">Students</th>
                 </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{district.name}</td>
                    <td className="px-4 py-3 text-right">{district.schools_count?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-right">{district.activities_count?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={
                        (district.compliance_rate || 0) >= 80 ? "text-green-600" :
                        (district.compliance_rate || 0) >= 70 ? "text-amber-600" :
                        "text-red-600"
                      }>
                        {(district.compliance_rate || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{(district.students_count || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top and Bottom Districts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Districts</CardTitle>
          </CardHeader>
          <CardContent>
            {districts.slice(0, 5).map((district, index) => (
              <div key={district.id} className="flex justify-between items-center py-2">
                <span>{index + 1}. {district.name}</span>
                <span className="text-green-600 font-medium">{(district.compliance_rate || 0).toFixed(1)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Areas Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            {[...districts]
              .sort((a, b) => (a.compliance_rate || 0) - (b.compliance_rate || 0))
              .slice(0, 5)
              .map((district, index) => (
                <div key={district.id} className="flex justify-between items-center py-2">
                  <span>
                    <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-500" />
                    {district.name}
                  </span>
                  <span className="text-red-600 font-medium">{(district.compliance_rate || 0).toFixed(1)}%</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;