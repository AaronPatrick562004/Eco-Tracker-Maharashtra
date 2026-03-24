// src/components/ConnectionTest.tsx
import React, { useState } from 'react';
import { supabase, testConnection } from '@/lib/supabase';

const ConnectionTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);

  const handleTest = async () => {
    setLoading(true);
    const test = await testConnection();
    setResult(test);
    setLoading(false);
  };

  const handleFetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*');
      
      if (error) throw error;
      setSchools(data || []);
      setResult({ success: true, count: data?.length });
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="text-gray-600 mb-4">URL: ubnxvxxknbirfpkbxoao.supabase.co</p>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        
        <button
          onClick={handleFetchSchools}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fetch All Schools
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Success!' : '❌ Failed'}
          </h3>
          {result.count !== undefined && (
            <p className="mt-2">Found {result.count} schools in database</p>
          )}
          {result.error && <p className="mt-2 text-red-600">Error: {result.error}</p>}
        </div>
      )}
      
      {schools.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Schools ({schools.length}):</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(schools.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;