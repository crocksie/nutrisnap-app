import React, { useState, useEffect, useCallback } from 'react';

interface MealRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  tags: string[];
}

interface MealRecommendationsProps {
  currentCalories: number;
  currentProtein: number;
  currentCarbs: number;
  currentFat: number;
  goals: {
    daily_calories?: number;
    daily_protein?: number;
    daily_carbs?: number;
    daily_fat?: number;
  };
}

const MealRecommendations: React.FC<MealRecommendationsProps> = ({
  currentCalories,
  currentProtein,
  currentCarbs,
  currentFat,
  goals
}) => {  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);

  const remainingCalories = (goals.daily_calories || 0) - currentCalories;
  const remainingProtein = (goals.daily_protein || 0) - currentProtein;
  const remainingCarbs = (goals.daily_carbs || 0) - currentCarbs;
  const remainingFat = (goals.daily_fat || 0) - currentFat;

  // Simple meal database (in a real app, this would be from your database)
  const mealDatabase: MealRecommendation[] = [
    {
      id: '1',
      name: 'Greek Yogurt with Berries',
      calories: 150,
      protein: 15,
      carbs: 20,
      fat: 3,
      ingredients: ['Greek yogurt', 'mixed berries', 'honey'],
      tags: ['breakfast', 'high-protein', 'low-fat']
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 300,
      protein: 35,
      carbs: 10,
      fat: 12,
      ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'vegetables'],
      tags: ['lunch', 'high-protein', 'low-carb']
    },
    {
      id: '3',
      name: 'Avocado Toast',
      calories: 250,
      protein: 8,
      carbs: 30,
      fat: 15,
      ingredients: ['whole grain bread', 'avocado', 'lime', 'salt'],
      tags: ['breakfast', 'healthy-fats', 'vegetarian']
    },
    {
      id: '4',
      name: 'Salmon with Rice',
      calories: 400,
      protein: 30,
      carbs: 45,
      fat: 15,
      ingredients: ['salmon fillet', 'brown rice', 'vegetables'],
      tags: ['dinner', 'balanced', 'omega-3']
    },
    {
      id: '5',
      name: 'Protein Smoothie',
      calories: 200,
      protein: 25,
      carbs: 15,
      fat: 5,
      ingredients: ['protein powder', 'banana', 'spinach', 'almond milk'],
      tags: ['snack', 'high-protein', 'post-workout']
    }
  ];
  const getRecommendations = useCallback(() => {
    if (!goals.daily_calories) return [];

    // Filter meals that fit within remaining macros (with some flexibility)
    const suitable = mealDatabase.filter(meal => {
      const calorieBuffer = 50; // Allow 50 calorie buffer
      const macroBuffer = 0.2; // 20% buffer for macros
      
      return (
        meal.calories <= remainingCalories + calorieBuffer &&
        meal.protein <= remainingProtein + (remainingProtein * macroBuffer) &&
        meal.carbs <= remainingCarbs + (remainingCarbs * macroBuffer) &&
        meal.fat <= remainingFat + (remainingFat * macroBuffer)
      );
    });

    // Sort by how well they fit the remaining macros
    return suitable.sort((a, b) => {
      const scoreA = Math.abs(a.calories - remainingCalories) + 
                    Math.abs(a.protein - remainingProtein) +
                    Math.abs(a.carbs - remainingCarbs) +
                    Math.abs(a.fat - remainingFat);
      
      const scoreB = Math.abs(b.calories - remainingCalories) + 
                    Math.abs(b.protein - remainingProtein) +
                    Math.abs(b.carbs - remainingCarbs) +
                    Math.abs(b.fat - remainingFat);
      
      return scoreA - scoreB;
    }).slice(0, 3); // Top 3 recommendations
  }, [mealDatabase, remainingCalories, remainingProtein, remainingCarbs, remainingFat, goals.daily_calories]);

  useEffect(() => {
    setRecommendations(getRecommendations());
  }, [getRecommendations]);

  if (remainingCalories <= 0) {
    return (
      <div className="meal-recommendations">
        <h3>Meal Recommendations</h3>
        <div className="alert alert-info">
          You've reached your calorie goal for today! 🎉
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="meal-recommendations">
        <h3>Meal Recommendations</h3>
        <div className="alert alert-warning">
          No suitable meal recommendations found for your remaining macros.
        </div>
      </div>
    );
  }

  return (
    <div className="meal-recommendations">
      <h3>Recommended Meals</h3>
      <div className="remaining-macros">
        <small className="text-muted">
          Remaining: {remainingCalories.toFixed(0)} kcal | 
          {remainingProtein.toFixed(1)}g protein | 
          {remainingCarbs.toFixed(1)}g carbs | 
          {remainingFat.toFixed(1)}g fat
        </small>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map(meal => (
          <div key={meal.id} className="recommendation-card">
            <div className="recommendation-header">
              <h4>{meal.name}</h4>
              <span className="recommendation-calories">{meal.calories} kcal</span>
            </div>
            
            <div className="recommendation-macros">
              <span>P: {meal.protein}g</span>
              <span>C: {meal.carbs}g</span>
              <span>F: {meal.fat}g</span>
            </div>
            
            <div className="recommendation-tags">
              {meal.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            
            <button className="btn btn-sm btn-outline-primary">
              Add to Meal Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealRecommendations;
