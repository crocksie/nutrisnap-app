import React from 'react';

interface NutritionTrendsProps {
  weeklyData: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  goals: {
    daily_calories?: number;
    daily_protein?: number;
    daily_carbs?: number;
    daily_fat?: number;
  };
}

const NutritionTrends: React.FC<NutritionTrendsProps> = ({ weeklyData, goals }) => {
  const calculateAverages = () => {
    if (weeklyData.length === 0) return null;
    
    const totals = weeklyData.reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const count = weeklyData.length;
    return {
      calories: totals.calories / count,
      protein: totals.protein / count,
      carbs: totals.carbs / count,
      fat: totals.fat / count,
    };
  };

  const averages = calculateAverages();

  if (!averages) {
    return (
      <div className="empty-state text-center">
        <p>Not enough data to show trends</p>
      </div>
    );
  }

  return (
    <div className="nutrition-trends">
      <h3>Weekly Averages</h3>
      <div className="trends-grid">
        <div className="trend-item">
          <div className="trend-label">Avg. Calories</div>
          <div className="trend-value">{averages.calories.toFixed(0)} kcal</div>
          {goals.daily_calories && (
            <div className="trend-vs-goal">
              {averages.calories > goals.daily_calories ? '+' : ''}
              {(averages.calories - goals.daily_calories).toFixed(0)} vs goal
            </div>
          )}
        </div>
        
        <div className="trend-item">
          <div className="trend-label">Avg. Protein</div>
          <div className="trend-value">{averages.protein.toFixed(1)}g</div>
          {goals.daily_protein && (
            <div className="trend-vs-goal">
              {averages.protein > goals.daily_protein ? '+' : ''}
              {(averages.protein - goals.daily_protein).toFixed(1)}g vs goal
            </div>
          )}
        </div>

        <div className="trend-item">
          <div className="trend-label">Avg. Carbs</div>
          <div className="trend-value">{averages.carbs.toFixed(1)}g</div>
          {goals.daily_carbs && (
            <div className="trend-vs-goal">
              {averages.carbs > goals.daily_carbs ? '+' : ''}
              {(averages.carbs - goals.daily_carbs).toFixed(1)}g vs goal
            </div>
          )}
        </div>

        <div className="trend-item">
          <div className="trend-label">Avg. Fat</div>
          <div className="trend-value">{averages.fat.toFixed(1)}g</div>
          {goals.daily_fat && (
            <div className="trend-vs-goal">
              {averages.fat > goals.daily_fat ? '+' : ''}
              {(averages.fat - goals.daily_fat).toFixed(1)}g vs goal
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionTrends;
