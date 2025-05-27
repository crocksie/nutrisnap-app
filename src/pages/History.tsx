import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Define an interface for a historical meal entry
interface MealEntry {
  id: string;
  date: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number;
  water?: number;
  amount?: number; // Add amount field
  micros?: { [key: string]: string };
}

function History() {
  const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days ago
    to: new Date().toISOString().slice(0, 10) // today
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const fetchMealHistory = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateRange.from)
        .lte('date', dateRange.to)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch meal history: ' + error.message);
        setMealHistory([]);
      } else {        setMealHistory(
          (data || []).map((row) => ({
            id: row.id,
            date: row.date,
            food: row.food_description,
            calories: row.calories,
            protein: row.protein,
            carbs: row.carbs,
            fat: row.fat,
            fibre: row.fibre,
            water: row.water,
            amount: row.amount || 100, // Add amount field with default
            micros: row.micros || {},
          }))
        );
      }
      setLoading(false);
    };

    fetchMealHistory();
  }, [userId, dateRange]);

  const groupedHistory = mealHistory.reduce((acc, meal) => {
    if (!acc[meal.date]) {
      acc[meal.date] = [];
    }
    acc[meal.date].push(meal);
    return acc;
  }, {} as { [date: string]: MealEntry[] });

  return (
    <div className="page-container history-page">
      <h1 className="text-center">Meal History</h1>

      <div className="app-card history-filters-card">
        <div className="app-card-header">
          <h2>Filter by Date</h2>
        </div>
        <div className="app-card-content">
          <div className="form-input-group-inline">
            <div className="form-input-group">
              <label htmlFor="from-date">From:</label>
              <input
                type="date"
                id="from-date"
                value={dateRange.from}
                onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-input-group">
              <label htmlFor="to-date">To:</label>
              <input
                type="date"
                id="to-date"
                value={dateRange.to}
                onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      )}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!loading && mealHistory.length === 0 && (
        <div className="app-card empty-state-card">
          <div className="app-card-content text-center">
            <p className="empty-state-text">No meal history found for this period.</p>
          </div>
        </div>
      )}

      {Object.keys(groupedHistory).length > 0 && (
        <div className="history-timeline">
          {Object.entries(groupedHistory).map(([date, meals]) => {
            const dayTotalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
            const dayTotalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
            const dayTotalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
            const dayTotalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

            return (
              <div key={date} className="app-card history-day-card">
                <div className="app-card-header">
                  <h3>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <div className="day-summary text-sm text-muted">
                    <span>Total: {dayTotalCalories.toFixed(0)} kcal</span>
                    <span>P: {dayTotalProtein.toFixed(1)}g</span>
                    <span>C: {dayTotalCarbs.toFixed(1)}g</span>
                    <span>F: {dayTotalFat.toFixed(1)}g</span>
                  </div>
                </div>
                <div className="app-card-content">
                  <ul className="meal-list">
                    {meals.map(meal => (                      <li key={meal.id} className="meal-item">
                        <div className="meal-item-header">
                          <span className="meal-name">{meal.food}</span>
                          <span className="meal-calories">
                            {meal.calories} kcal
                            {meal.amount && meal.amount !== 100 && ` (${meal.amount}g)`}
                          </span>
                        </div>
                        <div className="meal-macros text-sm text-muted">
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                          {meal.fibre != null && <span>Fib: {meal.fibre}g</span>}
                          {meal.water != null && <span>H₂O: {meal.water}ml</span>}
                        </div>
                        {/* Consider adding a small visual indicator or edit/delete if needed in future */}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
