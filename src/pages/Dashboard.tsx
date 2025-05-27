import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import QuickActions from '../components/QuickActions';
import NutritionProgressBar from '../components/NutritionProgressBar';
import NutritionTrends from '../components/NutritionTrends';
import MealRecommendations from '../components/MealRecommendations';

// Define an interface for daily summary data
interface DailySummary {
  date: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micros?: { [key: string]: string };
}

// Define a type for a meal row from Supabase
interface MealRow {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount?: number; // Add amount field
  micros?: { [key: string]: string };
}

// Define interface for user goals
interface UserGoals {
  daily_calories?: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  daily_fiber?: number;
  daily_water?: number;
  weight_goal?: number;
  goal_type?: 'lose' | 'maintain' | 'gain';
}

// Add a date picker and weekly summary to the dashboard
function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoals>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    })();
  }, []);

  // Fetch daily summary for selected date
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    (async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedDate);
      if (error) {
        setError('Failed to fetch daily summary: ' + error.message);
        setDailySummary(null);
      } else {
        // Aggregate macros and micros for the day
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        const micros: { [key: string]: string } = {};
        (data as MealRow[]).forEach((row) => {
          calories += row.calories || 0;
          protein += row.protein || 0;
          carbs += row.carbs || 0;
          fat += row.fat || 0;
          if (row.micros) {
            Object.entries(row.micros).forEach(([k, v]) => {
              micros[k] = String(v);
            });
          }
        });
        setDailySummary({
          date: selectedDate,
          calories,
          macros: { protein, carbs, fat },
          micros,
        });
      }
      setLoading(false);
    })();
  }, [userId, selectedDate]);

  // Fetch weekly summary (last 7 days)
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    (async () => {
      const today = new Date(selectedDate);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekAgo.toISOString().slice(0, 10))
        .lte('date', today.toISOString().slice(0, 10));
      if (error) {
        setError('Failed to fetch weekly summary: ' + error.message);
        setWeeklySummary([]);
      } else {
        // Group by date
        const grouped: { [date: string]: DailySummary } = {};
        (data as MealRow[]).forEach((row) => {
          if (!grouped[row.date]) {
            grouped[row.date] = {
              date: row.date,
              calories: 0,
              macros: { protein: 0, carbs: 0, fat: 0 },
              micros: {},
            };
          }
          grouped[row.date].calories += row.calories || 0;
          grouped[row.date].macros.protein += row.protein || 0;
          grouped[row.date].macros.carbs += row.carbs || 0;
          grouped[row.date].macros.fat += row.fat || 0;
          if (row.micros) {
            Object.entries(row.micros).forEach(([k, v]) => {
              grouped[row.date].micros![k] = String(v);
            });
          }
        });
        // Sort by date descending
        const sorted = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
        setWeeklySummary(sorted);
      }
      setLoading(false);
    })();
  }, [userId, selectedDate]);

  // Fetch user goals
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_calories, daily_protein, daily_carbs, daily_fat, daily_fiber, daily_water, weight_goal, goal_type')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUserGoals(data);
      }
    })();
  }, [userId]);

  return (
    <div className="page-container dashboard-page">
      <h1 className="text-center">NutriSnap Dashboard</h1>

      <QuickActions />

      <div className="app-card date-picker-card">
        <div className="app-card-content">
          <div className="form-input-group">
            <label htmlFor="dashboard-date">Select Day:</label>
            <input
              type="date"
              id="dashboard-date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading summary...</p>
        </div>
      )}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {dailySummary && (
        <div className="app-card daily-summary-card">
          <div className="app-card-header">
            <h2>Daily Summary - {new Date(dailySummary.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          </div>
          <div className="app-card-content">
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Nutrient</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Calories</td>
                    <td>{dailySummary.calories.toFixed(0)} kcal</td>
                  </tr>
                  <tr>
                    <td>Protein</td>
                    <td>{dailySummary.macros.protein.toFixed(1)} g</td>
                  </tr>
                  <tr>
                    <td>Carbs</td>
                    <td>{dailySummary.macros.carbs.toFixed(1)} g</td>
                  </tr>
                  <tr>
                    <td>Fat</td>
                    <td>{dailySummary.macros.fat.toFixed(1)} g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {!loading && !dailySummary && !error && (
         <div className="app-card empty-state-card">
          <div className="app-card-content text-center">
            <p className="empty-state-text">No data recorded for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
          </div>
        </div>
      )}

      <div className="app-card weekly-overview-card">
        <div className="app-card-header">
          <h2>Weekly Overview (Last 7 days from selected date)</h2>
        </div>
        <div className="app-card-content">
          {weeklySummary.length === 0 && !loading && !error && (
            <div className="empty-state text-center">
              <p className="empty-state-text">No data available for this week.</p>
            </div>
          )}
          {weeklySummary.length > 0 && (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Calories</th>
                    <th>Protein (g)</th>
                    <th>Carbs (g)</th>
                    <th>Fat (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklySummary.map(day => (
                    <tr key={day.date}>
                      <td>{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td>{day.calories.toFixed(0)}</td>
                      <td>{day.macros.protein.toFixed(1)}</td>
                      <td>{day.macros.carbs.toFixed(1)}</td>
                      <td>{day.macros.fat.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="app-card nutrition-trends-card">
        <div className="app-card-header">
          <h2>Weekly Nutrition Trends</h2>
        </div>
        <div className="app-card-content">
          <NutritionTrends 
            weeklyData={weeklySummary.map(day => ({
              date: day.date,
              calories: day.calories,
              protein: day.macros.protein,
              carbs: day.macros.carbs,
              fat: day.macros.fat
            }))} 
            goals={userGoals} 
          />
        </div>
      </div>

      {dailySummary && (
        <div className="app-card meal-recommendations-card">
          <div className="app-card-header">
            <h2>Meal Suggestions</h2>
          </div>
          <div className="app-card-content">
            <MealRecommendations 
              currentCalories={dailySummary.calories}
              currentProtein={dailySummary.macros.protein}
              currentCarbs={dailySummary.macros.carbs}
              currentFat={dailySummary.macros.fat}
              goals={userGoals}
            />
          </div>
        </div>
      )}

      <div className="app-card user-goals-card">
        <div className="app-card-header">
          <h2>Your Nutrition Goals</h2>
        </div>
        <div className="app-card-content">
          {userGoals.daily_calories && dailySummary && (
            <div className="nutrition-goals-grid">
              <NutritionProgressBar 
                label="Calories"
                current={dailySummary.calories}
                target={userGoals.daily_calories}
                unit="kcal"
                color="success"
              />
              {userGoals.daily_protein && (
                <NutritionProgressBar 
                  label="Protein"
                  current={dailySummary.macros.protein}
                  target={userGoals.daily_protein}
                  unit="g"
                  color="primary"
                />
              )}
              {userGoals.daily_carbs && (
                <NutritionProgressBar 
                  label="Carbs"
                  current={dailySummary.macros.carbs}
                  target={userGoals.daily_carbs}
                  unit="g"
                  color="warning"
                />
              )}
              {userGoals.daily_fat && (
                <NutritionProgressBar 
                  label="Fat"
                  current={dailySummary.macros.fat}
                  target={userGoals.daily_fat}
                  unit="g"
                  color="danger"
                />
              )}
            </div>
          )}
          {!userGoals.daily_calories && (
            <div className="empty-state text-center">
              <p>Set up your nutrition goals in your <a href="/profile">Profile</a> to track progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
