import React, { useState, useEffect, useCallback } from 'react';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
}

interface FoodDatabaseSearchProps {
  onSelectFood: (food: FoodItem, amount: number) => void;
}

// Mock food database (in a real app, this would be from your API or database)
const foodDatabase: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0
  },
  {
    id: '2',
    name: 'Brown Rice',
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8
  },
  {
    id: '3',
    name: 'Broccoli',
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6
  },
  {
    id: '4',
    name: 'Banana',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6
  },
  {
    id: '5',
    name: 'Greek Yogurt',
    brand: 'Plain',
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0
  },
  {
    id: '6',
    name: 'Almonds',
    calories_per_100g: 576,
    protein_per_100g: 21,
    carbs_per_100g: 22,
    fat_per_100g: 49,
    fiber_per_100g: 12
  },
  {
    id: '7',
    name: 'Whole Wheat Bread',
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
    fiber_per_100g: 6
  }
];

const FoodDatabaseSearch: React.FC<FoodDatabaseSearchProps> = ({ onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState<number>(100);

  const searchFoods = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = foodDatabase.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        (food.brand && food.brand.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFoods(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchFoods]);

  const calculateNutrition = (food: FoodItem, grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: Math.round(food.calories_per_100g * multiplier),
      protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(food.fat_per_100g * multiplier * 10) / 10,
      fiber: food.fiber_per_100g ? Math.round(food.fiber_per_100g * multiplier * 10) / 10 : 0
    };
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onSelectFood(selectedFood, amount);
      setSelectedFood(null);
      setAmount(100);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="food-database-search">
      <div className="search-section">
        <div className="form-input-group">
          <label htmlFor="food-search">Search Food Database</label>
          <input
            type="text"
            id="food-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for foods (e.g., chicken, rice, banana...)"
            className="form-input"
          />
        </div>

        {loading && (
          <div className="search-loading">
            <div className="spinner-sm"></div>
            <span>Searching...</span>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Search Results</h4>
            <div className="food-results-list">
              {searchResults.map(food => (
                <div 
                  key={food.id} 
                  className={`food-result-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="food-info">
                    <div className="food-name">
                      {food.name}
                      {food.brand && <span className="food-brand"> - {food.brand}</span>}
                    </div>
                    <div className="food-nutrition-preview">
                      {food.calories_per_100g} kcal per 100g
                    </div>
                  </div>
                  <div className="food-macros-preview">
                    <span>P: {food.protein_per_100g}g</span>
                    <span>C: {food.carbs_per_100g}g</span>
                    <span>F: {food.fat_per_100g}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFood && (
          <div className="selected-food-section">
            <h4>Add to Meal</h4>
            <div className="selected-food-card">
              <div className="selected-food-header">
                <h5>{selectedFood.name}</h5>
                {selectedFood.brand && <span className="food-brand">{selectedFood.brand}</span>}
              </div>

              <div className="amount-input-section">
                <div className="form-input-group">
                  <label htmlFor="food-amount">Amount (grams)</label>
                  <input
                    type="number"
                    id="food-amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                    className="form-input"
                  />
                </div>

                <div className="nutrition-calculation">
                  {(() => {
                    const nutrition = calculateNutrition(selectedFood, amount);
                    return (
                      <div className="calculated-nutrition">
                        <div className="nutrition-summary">
                          <strong>{nutrition.calories} kcal</strong>
                        </div>
                        <div className="nutrition-details">
                          <span>Protein: {nutrition.protein}g</span>
                          <span>Carbs: {nutrition.carbs}g</span>
                          <span>Fat: {nutrition.fat}g</span>
                          {nutrition.fiber > 0 && <span>Fiber: {nutrition.fiber}g</span>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="food-actions">
                <button 
                  onClick={handleAddFood} 
                  className="btn btn-primary"
                  disabled={amount <= 0}
                >
                  Add to Meal
                </button>
                <button 
                  onClick={() => {
                    setSelectedFood(null);
                    setAmount(100);
                  }} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="no-results">
            <p>No foods found for "{searchQuery}". Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDatabaseSearch;
