// src/hooks/useRealtime.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeSubscription<T>(
  table: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setData(result || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          console.log(`${table} real-time update:`, payload);
          
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => (item as any).id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              (item as any).id === payload.new.id ? payload.new as T : item
            ));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);

  return { data, loading, error, setData };
}