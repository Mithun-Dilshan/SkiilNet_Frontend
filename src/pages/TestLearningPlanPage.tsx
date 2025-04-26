import { useState, useEffect } from 'react';
import { getAllLearningPlans, LearningPlan } from '../services/api/learningPlans';

const TestLearningPlanPage = () => {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getAllLearningPlans();
        setPlans(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load learning plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Learning Plans API</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <p className="mb-4">Found {plans.length} learning plans</p>
          
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <p className="text-gray-700">{plan.description}</p>
                <div className="mt-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {plan.subject}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Created by: {plan.user?.name || "Unknown user"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TestLearningPlanPage; 