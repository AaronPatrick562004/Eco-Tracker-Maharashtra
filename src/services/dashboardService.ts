// src/services/dashboardService.ts
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalSchools: number;
  totalActivities: number;
  complianceRate: number;
  schoolsAtRisk: number;
  lastUpdated: string;
}

export interface ActivityBreakdown {
  type_name: string;
  count: number;
  percentage: number;
  trend: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  type: string;
  school_name: string;
  date: string;
  students_participated: number;
  status: string;
  created_at: string;
}

export interface TopDistrict {
  name: string;
  schools_count: number;
  compliance_rate: number;
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    console.log('Fetching dashboard stats...');
    
    try {
      // Get total schools count
      const { count: totalSchools, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
      
      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
      }
      console.log('Total schools:', totalSchools);

      // Get total activities count
      const { count: totalActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      }
      console.log('Total activities:', totalActivities);

      // Get schools at risk (compliance = 'red')
      const { count: schoolsAtRisk, error: atRiskError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('compliance', 'red');
      
      if (atRiskError) {
        console.error('Error fetching at-risk schools:', atRiskError);
      }
      console.log('Schools at risk:', schoolsAtRisk);

      // Get compliance rate from dashboard_stats or calculate
      let complianceRate = 0;
      const { data: stats, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .maybeSingle();
      
      if (statsError) {
        console.error('Error fetching dashboard_stats:', statsError);
        
        // Calculate compliance rate from schools if dashboard_stats is empty
        const { data: allSchools, error: allSchoolsError } = await supabase
          .from('schools')
          .select('compliance');
        
        if (!allSchoolsError && allSchools && allSchools.length > 0) {
          const greenSchools = allSchools.filter(s => s.compliance === 'green').length;
          complianceRate = (greenSchools / allSchools.length) * 100;
          console.log('Calculated compliance rate:', complianceRate);
        }
      } else if (stats) {
        complianceRate = stats.compliance_rate;
        console.log('Compliance rate from dashboard_stats:', complianceRate);
      }

      return {
        totalSchools: totalSchools || 0,
        totalActivities: totalActivities || 0,
        complianceRate: Math.round(complianceRate * 10) / 10,
        schoolsAtRisk: schoolsAtRisk || 0,
        lastUpdated: stats?.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        totalSchools: 0,
        totalActivities: 0,
        complianceRate: 0,
        schoolsAtRisk: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async getActivityBreakdown(): Promise<ActivityBreakdown[]> {
    console.log('Fetching activity breakdown...');
    
    try {
      // First try to get from activity_types table
      const { data: activityTypes, error: typesError } = await supabase
        .from('activity_types')
        .select('type_name, count, percentage, trend')
        .order('count', { ascending: false });
      
      // If activity_types has data, use it
      if (!typesError && activityTypes && activityTypes.length > 0) {
        console.log('Using activity_types table:', activityTypes);
        return activityTypes;
      }
      
      // Otherwise, calculate from activities table
      console.log('Calculating activity breakdown from activities table...');
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('type');
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        return [];
      }
      
      if (!activities || activities.length === 0) {
        return [];
      }
      
      // Count by type
      const typeCounts: Record<string, number> = {};
      activities.forEach(activity => {
        const type = activity.type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      const total = activities.length;
      const typeNames: Record<string, string> = {
        'plantation': 'Tree Plantation',
        'water': 'Water Conservation',
        'waste': 'Waste Management',
        'energy': 'Energy Saving',
        'air': 'Clean Air'
      };
      
      const breakdown = Object.entries(typeCounts).map(([type, count]) => ({
        type_name: typeNames[type] || type,
        count,
        percentage: Math.round((count / total) * 100),
        trend: 0
      }));
      
      console.log('Calculated activity breakdown:', breakdown);
      return breakdown;
      
    } catch (error) {
      console.error('Error in getActivityBreakdown:', error);
      return [];
    }
  }

  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    console.log('Fetching recent activities...');
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          type,
          school_name,
          date,
          students_participated,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
      
      console.log('Recent activities fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  }

  static async getTopDistricts(limit: number = 5): Promise<TopDistrict[]> {
    console.log('Fetching top districts...');
    
    try {
      // First try to get from districts table
      const { data: districts, error: districtsError } = await supabase
        .from('districts')
        .select('name, schools_count, compliance_rate')
        .order('compliance_rate', { ascending: false })
        .limit(limit);
      
      if (!districtsError && districts && districts.length > 0) {
        console.log('Top districts from districts table:', districts);
        return districts;
      }
      
      // Otherwise, calculate from schools
      console.log('Calculating top districts from schools...');
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('district, compliance');
      
      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        return [];
      }
      
      if (!schools || schools.length === 0) {
        return [];
      }
      
      // Aggregate by district
      const districtMap = new Map<string, { total: number; green: number }>();
      
      schools.forEach(school => {
        const district = school.district;
        if (!districtMap.has(district)) {
          districtMap.set(district, { total: 0, green: 0 });
        }
        const data = districtMap.get(district)!;
        data.total++;
        if (school.compliance === 'green') {
          data.green++;
        }
      });
      
      // Calculate compliance rate and format
      const calculatedDistricts = Array.from(districtMap.entries()).map(([name, data]) => ({
        name,
        schools_count: data.total,
        compliance_rate: Math.round((data.green / data.total) * 100)
      }));
      
      // Sort by compliance rate and limit
      const topDistricts = calculatedDistricts
        .sort((a, b) => b.compliance_rate - a.compliance_rate)
        .slice(0, limit);
      
      console.log('Calculated top districts:', topDistricts);
      return topDistricts;
      
    } catch (error) {
      console.error('Error in getTopDistricts:', error);
      return [];
    }
  }

  static async getAllDashboardData() {
    try {
      console.log('Fetching all dashboard data...');
      
      const [stats, activityBreakdown, recentActivities, topDistricts] = await Promise.all([
        this.getDashboardStats(),
        this.getActivityBreakdown(),
        this.getRecentActivities(5),
        this.getTopDistricts(5)
      ]);

      console.log('Final dashboard data:', { 
        stats, 
        activityBreakdownCount: activityBreakdown.length,
        recentActivitiesCount: recentActivities.length,
        topDistrictsCount: topDistricts.length
      });

      return {
        stats,
        activityBreakdown,
        recentActivities,
        topDistricts,
        success: true
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper method to update dashboard stats (call this when data changes)
  static async updateDashboardStats() {
    try {
      const stats = await this.getDashboardStats();
      
      const { error } = await supabase
        .from('dashboard_stats')
        .upsert({
          total_schools: stats.totalSchools,
          total_activities: stats.totalActivities,
          schools_at_risk: stats.schoolsAtRisk,
          compliance_rate: stats.complianceRate,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating dashboard_stats:', error);
      } else {
        console.log('Dashboard stats updated successfully');
      }
    } catch (error) {
      console.error('Error in updateDashboardStats:', error);
    }
  }
}