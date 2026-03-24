import { useState, useEffect } from 'react';
import { schoolsAPI } from '@/lib/api';  // Change this line

const DataTest = () => {
    const [schools, setSchools] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        students: ''
    });

    // Fetch schools on load
    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            // Use your schoolsAPI
            const data = await schoolsAPI.getAll();
            setSchools(data || []);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const created = await schoolsAPI.create({
                name: formData.name,
                district: formData.district,
                students_count: parseInt(formData.students)
            });
            console.log('School created:', created);
            
            // Refresh the list
            fetchSchools();
            
            // Clear form
            setFormData({ name: '', district: '', students: '' });
        } catch (error) {
            console.error('Error creating school:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Backend Data Test</h1>
            
            {/* Form to add data */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-3">Add New School</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="School Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="District"
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Number of Students"
                        value={formData.students}
                        onChange={(e) => setFormData({...formData, students: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Add School'}
                    </button>
                </form>
            </div>

            {/* Display schools from backend */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Schools in Backend ({schools.length})</h2>
                <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(schools, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default DataTest;