import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressSteps from '../components/ProgressSteps';
import SuccessMessage from '../components/SuccessMessage';
import SmartUserGuide from '../components/SmartUserGuide';
import { UserExperienceService } from '../services/UserExperienceService';

// Define an interface for the nutrition results
interface NutritionResults {
  food: string;
  calories: number;
  amount: number; // Amount in grams
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fibre?: number;
    water?: number;
  };
  micros?: { [key: string]: string }; // Optional micros with string values
}

// Interface for identified food items with estimated portions
interface IdentifiedFoodItem {
  food: string;
  estimatedGrams: number;
}

// Add a type for Supabase meal row
interface MealRow {
  id: string;
  date: string;
  food_description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number;
  water?: number;
  amount?: number;
  micros?: { [key: string]: string };
}

// Add a type for a logged food entry
interface LoggedFoodEntry extends NutritionResults {
  id: string; // unique id for editing/deleting
  date: string; // ISO date string
}

// Define interface for FatSecret search results
interface FatSecretFoodResult {
  food_id: string;
  food_name: string;
  food_description: string;
  food_type: string;
  food_url?: string;
}

// Initialize Google Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;



const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);



// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

function UploadFood() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [identifiedFoodItems, setIdentifiedFoodItems] = useState<IdentifiedFoodItem[] | null>(null);
  const [selectedFoodForNutrition, setSelectedFoodForNutrition] = useState<string | null>(null);
  const [nutritionResults, setNutritionResults] = useState<NutritionResults | null>(null);
  const [fetchedNutritionForAllItems, setFetchedNutritionForAllItems] = useState<Map<string, NutritionResults>>(new Map());
  const [fetchedBaseNutritionForAllItems, setFetchedBaseNutritionForAllItems] = useState<Map<string, NutritionResults>>(new Map()); // Store original base nutrition
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // yyyy-mm-dd
  });  const [loggedFoods, setLoggedFoods] = useState<LoggedFoodEntry[]>([]);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);  const [editNutrition, setEditNutrition] = useState<NutritionResults | null>(null);  const [userId, setUserId] = useState<string | null>(null);  const [userExperience, setUserExperience] = useState<'new' | 'experienced' | 'expert'>('new');
  const [amountInputValue, setAmountInputValue] = useState<string>('100'); // Local state for amount
  
  // Food correction system state
  const [showCorrectionInterface, setShowCorrectionInterface] = useState<boolean>(false);
  const [correctionTargetFood, setCorrectionTargetFood] = useState<string>('');
  const [correctedFoodName, setCorrectedFoodName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FatSecretFoodResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Meal summary editing state
  const [editingMealItem, setEditingMealItem] = useState<string | null>(null);
  const [editingMealItemData, setEditingMealItemData] = useState<NutritionResults | null>(null);

  // Define the steps for the food logging process
  const steps = ['Upload Image', 'Identify Foods', 'Get Nutrition', 'Log Meal'];  // Fetch user ID on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    })();
  }, []);
  // Initialize user experience tracking
  useEffect(() => {
    if (!userId) return;
    const experience = UserExperienceService.getUserExperienceLevel();
    setUserExperience(experience);
  }, [userId]);

  // Fetch logs for selected day
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedDate)
        .order('created_at', { ascending: true });
      if (error) {
        setError('Failed to fetch food logs: ' + error.message);
        setLoggedFoods([]);
      } else {        setLoggedFoods(
          (data || []).map((row: MealRow) => ({
            id: row.id,
            date: row.date,
            food: row.food_description, // map to UI field
            calories: row.calories,
            amount: row.amount || 100, // Add amount field with default
            macros: {
              protein: row.protein,
              carbs: row.carbs,
              fat: row.fat,
              fibre: row.fibre,
              water: row.water,
            },
            micros: row.micros || {},
          }))
        );
      }
      setLoading(false);    })();  }, [userId, selectedDate]);
  
  // Sync amount input value with nutrition results
  useEffect(() => {
    if (nutritionResults) {
      setAmountInputValue(nutritionResults.amount.toString());
    }
  }, [nutritionResults]);
    // Handle video tutorial watch tracking
  const handleVideoWatch = (videoId: string) => {
    UserExperienceService.trackTutorialWatched(videoId);
  };

  // Handle guide dismissal and track user experience
  const handleGuideDismiss = (step: string) => {
    UserExperienceService.trackGuideDismissed(step);
    // Update user experience level after dismissal
    const newExperience = UserExperienceService.getUserExperienceLevel();
    setUserExperience(newExperience);
  };

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setError(null);
    }
  };  // Handle image analysis using Google Gemini Vision API
  const handleAnalyzeImage = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    setCurrentStep(1);
    
    try {
      // Check if API key is available
      if (!GEMINI_API_KEY) {
        throw new Error('Google Gemini API key is not configured. Please check environment variables.');
      }
      
      console.log('Starting image analysis with Gemini...');
      
      // Convert image to base64
      const base64Image = await fileToBase64(selectedFile);
      console.log('Image converted to base64, size:', base64Image.length);
      
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('Gemini model initialized');
      
      // Create prompt for food identification with portion estimation
      const prompt = `Analyze this food image and identify all visible food items with estimated portion sizes. For each food item, provide the name and estimated weight in grams based on visual cues like plate size, portion appearance, and common serving sizes.

Return the results as a JSON array with this format:
[{"food": "Food Name", "estimatedGrams": 150}, {"food": "Another Food", "estimatedGrams": 80}]

Guidelines for portion estimation:
- Use visual references like plate size, utensils, hands if visible
- Consider typical serving sizes (e.g., chicken breast ~150g, apple ~180g, slice of bread ~30g)
- For multiple items, estimate each separately
- If uncertain about size, use reasonable typical portions
- Minimum 20g, maximum 500g per item

Focus on identifying specific food items that can be found in nutrition databases.`;
      
      // Create image part for the API
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: selectedFile.type
        }
      };
      
      console.log('Calling Gemini Vision API...');
      
      // Call Gemini Vision API
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
        console.log('Gemini API response:', text);
      
      // Parse the response to extract food items with estimated amounts
      let foodItems: IdentifiedFoodItem[] = [];
      
      try {
        // Try to parse as JSON first (new format with portion estimation)
        const jsonResponse = JSON.parse(text.replace(/```json|```/g, '').trim());
        if (Array.isArray(jsonResponse)) {
          foodItems = jsonResponse.map((item: { food: string; estimatedGrams: number }) => ({
            food: item.food,
            estimatedGrams: Math.min(Math.max(item.estimatedGrams || 100, 20), 500) // Clamp between 20-500g
          }));
        }
      } catch {
        // Fallback to old format (comma-separated list)
        console.log('Using fallback parsing for non-JSON response');
        const simpleItems = text
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .slice(0, 10); // Limit to 10 items max
          
        foodItems = simpleItems.map(item => ({
          food: item,
          estimatedGrams: 100 // Default to 100g for fallback
        }));
      }
      
      console.log('Parsed food items with estimated amounts:', foodItems);
      
      if (foodItems.length > 0) {
        setIdentifiedFoodItems(foodItems);
        setCurrentStep(2);
      } else {
        throw new Error('No food items were identified in the image');
      }
        } catch (error) {
      console.error('Error analyzing image:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        apiKeyExists: !!GEMINI_API_KEY,
        apiKeyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to analyze image. ';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage += 'API configuration issue. Please contact support.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage += 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network connection issue. Please check your connection and try again.';
        } else {
          errorMessage += 'Please try again with a clearer photo containing visible food items.';
        }
      } else {
        errorMessage += 'Please try again with a clearer photo containing visible food items.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle amount changes for nutrition recalculation
  const handleAmountChange = (foodName: string, newAmount: number) => {
    // Get the ORIGINAL base nutrition for accurate calculations
    const baseNutrition = fetchedBaseNutritionForAllItems.get(foodName);
    
    if (baseNutrition) {
      const updatedNutrition = updateNutritionForAmount(baseNutrition, newAmount);
      
      // Update the current nutrition maps
      setFetchedNutritionForAllItems(prev => {
        const newMap = new Map(prev);
        newMap.set(foodName, updatedNutrition);
        return newMap;
      });
      
      // Update current nutrition results if this is the selected item
      if (selectedFoodForNutrition === foodName) {
        setNutritionResults(updatedNutrition);
      }
    }
  };
  // Fetch nutrition for a food item
  const fetchNutritionForFoodItem = async (foodName: string, estimatedGrams?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate nutrition fetching - in a real app this would use FatSecret API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use estimated grams or default to 100g
      const amount = estimatedGrams || 100;
      
      // Simulate nutrition data
      const mockNutrition: NutritionResults = {
        food: foodName,
        calories: Math.floor(Math.random() * 200) + 50,
        amount: amount,
        macros: {
          protein: Math.floor(Math.random() * 20) + 5,
          carbs: Math.floor(Math.random() * 30) + 10,
          fat: Math.floor(Math.random() * 15) + 2,
          fibre: Math.floor(Math.random() * 5) + 1,
        },
        micros: {}
      };
      
      setNutritionResults(mockNutrition);
      setSelectedFoodForNutrition(foodName);
      
      // Store in both maps
      setFetchedNutritionForAllItems(prev => new Map(prev).set(foodName, mockNutrition));
      setFetchedBaseNutritionForAllItems(prev => new Map(prev).set(foodName, mockNutrition));
        } catch {
      setError('Failed to fetch nutrition data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logging combined meal
  const handleLogCombinedMeal = async () => {
    if (fetchedNutritionForAllItems.size === 0 || !userId) {
      setError('No food items with nutrition data to log, or you are not logged in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFibre = 0;
      let totalAmount = 0;

      const mealFoodDescriptions: string[] = [];

      for (const itemNutrition of fetchedNutritionForAllItems.values()) {
        mealFoodDescriptions.push(itemNutrition.food);
        totalCalories += itemNutrition.calories;
        totalProtein += itemNutrition.macros.protein;
        totalCarbs += itemNutrition.macros.carbs;
        totalFat += itemNutrition.macros.fat;
        totalFibre += itemNutrition.macros.fibre || 0;
        totalAmount += itemNutrition.amount || 100;
      }      let combinedFoodDescription = mealFoodDescriptions.join(', ');
      if (mealFoodDescriptions.length > 1) {
        combinedFoodDescription = `Mixed Meal: ${mealFoodDescriptions.join(' + ')}`;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('meals')
        .insert([{
          user_id: userId,
          date: selectedDate,
          food_description: combinedFoodDescription,
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          fibre: totalFibre,
          amount: totalAmount,
        }]);

      if (error) {
        setError('Failed to log combined meal: ' + error.message);
      } else {
        setSuccessMessage(`Successfully logged combined meal with ${fetchedNutritionForAllItems.size} items (${totalCalories} calories total)!`);
        setCurrentStep(3);
        
        // Reset UI
        setSelectedFile(null);
        setImagePreviewUrl(null);
        setIdentifiedFoodItems(null);
        setSelectedFoodForNutrition(null);
        setNutritionResults(null);
        setFetchedNutritionForAllItems(new Map());
        setFetchedBaseNutritionForAllItems(new Map());
        setError(null);

        setTimeout(() => {
          setCurrentStep(0);
          setSuccessMessage(null);
        }, 3000);

        // Refresh logs
        const { data: refreshedData } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', userId)
          .eq('date', selectedDate)
          .order('created_at', { ascending: true });        if (refreshedData) {
          setLoggedFoods(refreshedData.map((row: MealRow) => ({
            id: row.id,
            date: row.date,
            food: row.food_description,
            calories: row.calories,
            amount: row.amount || 100,
            macros: {
              protein: row.protein,
              carbs: row.carbs,
              fat: row.fat,
              fibre: row.fibre,
              water: row.water,
            },
            micros: row.micros || {},
          })));
        }      }
    } catch {
      setError('An error occurred while logging the meal.');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing nutrition change
  const handleEditNutritionChange = (field: string, value: string) => {
    if (!editNutrition) return;
    
    const keys = field.split('.');
    if (keys.length === 1) {
      if (field === 'amount') {
        const newAmount = parseFloat(value) || 100;
        const baseCalories = editNutrition.calories / (editNutrition.amount || 100) * 100; // Calculate base calories per 100g
        const ratio = newAmount / 100;
        
        setEditNutrition({
          ...editNutrition,
          amount: newAmount,
          calories: Math.round(baseCalories * ratio),
          macros: {
            protein: Math.round((editNutrition.macros.protein / (editNutrition.amount || 100) * 100) * ratio * 10) / 10,
            carbs: Math.round((editNutrition.macros.carbs / (editNutrition.amount || 100) * 100) * ratio * 10) / 10,
            fat: Math.round((editNutrition.macros.fat / (editNutrition.amount || 100) * 100) * ratio * 10) / 10,
            fibre: editNutrition.macros.fibre ? Math.round((editNutrition.macros.fibre / (editNutrition.amount || 100) * 100) * ratio * 10) / 10 : undefined,
            water: editNutrition.macros.water ? Math.round((editNutrition.macros.water / (editNutrition.amount || 100) * 100) * ratio * 10) / 10 : undefined,
          }
        });
      } else {
        setEditNutrition({ ...editNutrition, [keys[0]]: value });
      }
    } else if (keys.length === 2 && keys[0] === 'macros') {
      setEditNutrition({
        ...editNutrition,
        macros: { ...editNutrition.macros, [keys[1]]: parseFloat(value) || 0 },
      });
    }
  };

  // Handle saving edits
  const handleSaveEdit = async () => {
    if (!editNutrition || !editEntryId || !userId) return;

    setLoading(true);
    const { error } = await supabase
      .from('meals')
      .update({
        food_description: editNutrition.food,
        calories: editNutrition.calories,
        amount: editNutrition.amount,
        protein: editNutrition.macros.protein,
        carbs: editNutrition.macros.carbs,
        fat: editNutrition.macros.fat,
        fibre: editNutrition.macros.fibre,
        water: editNutrition.macros.water,
        micros: editNutrition.micros,
      })
      .eq('id', editEntryId)
      .eq('user_id', userId);

    if (error) {
      setError('Failed to update food log: ' + error.message);
    } else {
      setLoggedFoods(loggedFoods.map(f => f.id === editEntryId ? { ...editNutrition, id: editEntryId, date: selectedDate } : f));
      setEditEntryId(null);
      setEditNutrition(null);
    }
    setLoading(false);
  };

  // Handle canceling edits
  const handleCancelEdit = () => {
    setEditEntryId(null);
    setEditNutrition(null);
  };

  // Handle editing a food entry
  const handleEditFood = (entry: LoggedFoodEntry) => {
    setEditEntryId(entry.id);
    setEditNutrition({ ...entry });
  };

  // Handle deleting a food entry
  const handleDeleteFood = async (entryId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      setError('Failed to delete food log: ' + error.message);
    } else {
      setLoggedFoods(loggedFoods.filter(f => f.id !== entryId));
    }
    setLoading(false);
  };

  // Food correction system handlers
  const handleCorrectionRequest = (originalFoodName: string) => {
    setCorrectionTargetFood(originalFoodName);
    setCorrectedFoodName(originalFoodName);
    setShowCorrectionInterface(true);
    setSearchResults([]);
  };

  const handleCorrectionSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
      setIsSearching(true);
    try {
      // Use environment variable for API endpoint - defaults to localhost for development
      const apiEndpoint = import.meta.env.PROD 
        ? '/api/fatsecret' // Vercel serverless function in production
        : 'http://localhost:3001/api/fatsecret'; // Local proxy in development
          const proxyResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchTerm }),
      });
      
      const fatsecretData = await proxyResponse.json();
      
      if (proxyResponse.ok && fatsecretData?.foods?.food) {
        const foods = Array.isArray(fatsecretData.foods.food) 
          ? fatsecretData.foods.food 
          : [fatsecretData.foods.food];
        setSearchResults(foods.slice(0, 10)); // Limit to 10 results
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for food corrections:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyCorrection = async (selectedFood: FatSecretFoodResult) => {
    if (!selectedFood || !correctionTargetFood) return;
    
    // Replace the nutrition data for the corrected food
    try {
      setLoading(true);
      
      // Parse nutrition from the selected food
      let calories = 0, protein = 0, carbs = 0, fat = 0, fibre = 0;
      
      if (selectedFood.food_description) {
        const desc = selectedFood.food_description;
        
        const calRegex = /Calories[^0-9]*([0-9]+(?:\.[0-9]+)?)/i;
        const calMatch = desc.match(calRegex);
        calories = calMatch ? parseFloat(calMatch[1]) : 0;
        
        const fatRegex = /Fat[^0-9]*([0-9]+(?:\.[0-9]+)?)/i;
        const fatMatch = desc.match(fatRegex);
        fat = fatMatch ? parseFloat(fatMatch[1]) : 0;
        
        const carbRegex = /Carbs?[^0-9]*([0-9]+(?:\.[0-9]+)?)/i;
        const carbMatch = desc.match(carbRegex);
        carbs = carbMatch ? parseFloat(carbMatch[1]) : 0;
        
        const proteinRegex = /Protein[^0-9]*([0-9]+(?:\.[0-9]+)?)/i;
        const proteinMatch = desc.match(proteinRegex);
        protein = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
        
        const fibreRegex = /(?:Fibre|Fiber)[^0-9]*([0-9]+(?:\.[0-9]+)?)/i;
        const fibreMatch = desc.match(fibreRegex);
        fibre = fibreMatch ? parseFloat(fibreMatch[1]) : 0;
      }
      
      const correctedNutrition: NutritionResults = {
        food: selectedFood.food_name || correctedFoodName,
        calories,
        amount: 100, // Default serving size
        macros: { protein, carbs, fat, fibre },
        micros: {},
      };
      
      // Update the nutrition maps with corrected data
      setFetchedNutritionForAllItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(correctionTargetFood); // Remove old entry
        newMap.set(correctedNutrition.food, correctedNutrition); // Add corrected entry
        return newMap;
      });
      
            setFetchedBaseNutritionForAllItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(correctionTargetFood); // Remove old entry
        newMap.set(correctedNutrition.food, correctedNutrition); // Add corrected entry
        return newMap;
      });
      
      // Update identified food items
      setIdentifiedFoodItems(prev => 
        prev ? prev.map(item => 
          item.food === correctionTargetFood ? {
            ...item,
            food: correctedNutrition.food
          } : item
        ) : prev
      );
      
      // Update current nutrition results if this was the selected item
      if (selectedFoodForNutrition === correctionTargetFood) {
        setNutritionResults(correctedNutrition);
        setSelectedFoodForNutrition(correctedNutrition.food);
      }
      
      // Close correction interface
      setShowCorrectionInterface(false);
      setCorrectionTargetFood('');
      setCorrectedFoodName('');
      setSearchResults([]);
      
      setSuccessMessage(`Successfully corrected "${correctionTargetFood}" to "${correctedNutrition.food}"`);
      
    } catch (error) {
      console.error('Error applying food correction:', error);
      setError('Failed to apply food correction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCorrection = () => {
    setShowCorrectionInterface(false);
    setCorrectionTargetFood('');
    setCorrectedFoodName('');
    setSearchResults([]);
  };

  // Meal summary editing handlers
  const handleEditMealItem = (foodName: string) => {
    const itemToEdit = fetchedNutritionForAllItems.get(foodName);
    if (itemToEdit) {
      setEditingMealItem(foodName);
      setEditingMealItemData({ ...itemToEdit });
    }
  };

  const handleSaveMealItemEdit = () => {
    if (!editingMealItem || !editingMealItemData) return;
    
    // Update the nutrition maps with edited data
    setFetchedNutritionForAllItems(prev => {
      const newMap = new Map(prev);
      newMap.set(editingMealItem, editingMealItemData);
      return newMap;
    });
    
    // Update base nutrition if needed
    setFetchedBaseNutritionForAllItems(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(editingMealItem)) {
        newMap.set(editingMealItem, editingMealItemData);
      }
      return newMap;
    });
    
    // Update current nutrition results if this was the selected item
    if (selectedFoodForNutrition === editingMealItem) {
      setNutritionResults(editingMealItemData);
    }
    
    // Close editing interface
    setEditingMealItem(null);
    setEditingMealItemData(null);
    
    setSuccessMessage(`Successfully updated "${editingMealItem}"`);
  };

  const handleCancelMealItemEdit = () => {
    setEditingMealItem(null);
    setEditingMealItemData(null);
  };

  const handleRemoveMealItem = (foodName: string) => {
    // Remove from nutrition maps
    setFetchedNutritionForAllItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(foodName);
      return newMap;
    });
    
    setFetchedBaseNutritionForAllItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(foodName);
      return newMap;
    });
    
    // Clear current nutrition results if this was the selected item
    if (selectedFoodForNutrition === foodName) {
      setNutritionResults(null);
      setSelectedFoodForNutrition(null);
    }
    
    setSuccessMessage(`Removed "${foodName}" from meal summary`);
  };

  const handleMealItemFieldChange = (field: string, value: string | number) => {
    if (!editingMealItemData) return;
    
    if (field === 'food') {
      setEditingMealItemData({
        ...editingMealItemData,
        food: value as string
      });
    } else if (field === 'calories') {
      setEditingMealItemData({
        ...editingMealItemData,
        calories: parseFloat(value as string) || 0
      });
    } else if (field === 'amount') {
      const newAmount = parseFloat(value as string) || 100;
      
      // Get base nutrition for accurate calculation
      const baseNutrition = fetchedBaseNutritionForAllItems.get(editingMealItem || '');
      if (baseNutrition) {
        const updatedNutrition = updateNutritionForAmount(baseNutrition, newAmount);
        setEditingMealItemData(updatedNutrition);
      } else {
        // Fallback if no base nutrition
        setEditingMealItemData({
          ...editingMealItemData,
          amount: newAmount
        });
      }
    } else if (field.startsWith('macros.')) {
      const macroField = field.split('.')[1];
      setEditingMealItemData({
        ...editingMealItemData,
        macros: {
          ...editingMealItemData.macros,
          [macroField]: parseFloat(value as string) || 0
        }
      });
    }
  };
  // Function to update nutrition values based on amount changes
  const updateNutritionForAmount = (baseNutrition: NutritionResults, newAmount: number): NutritionResults => {
    const ratio = newAmount / baseNutrition.amount;
    
    return {
      ...baseNutrition,
      amount: newAmount,
      calories: Math.round(baseNutrition.calories * ratio),
      macros: {
        protein: Math.round((baseNutrition.macros.protein * ratio) * 10) / 10, // Round to 1 decimal
        carbs: Math.round((baseNutrition.macros.carbs * ratio) * 10) / 10,
        fat: Math.round((baseNutrition.macros.fat * ratio) * 10) / 10,
        fibre: baseNutrition.macros.fibre ? Math.round((baseNutrition.macros.fibre * ratio) * 10) / 10 : undefined,
        water: baseNutrition.macros.water ? Math.round((baseNutrition.macros.water * ratio) * 10) / 10 : undefined,
      },
      micros: baseNutrition.micros // Micros are typically not scaled by amount
    };
  };


  return (
    <div className="page-container upload-food-page food-logging-container">
      <h1 className="text-center">Log Your Meal</h1>

      {/* Progress Steps */}
      {selectedFile && <ProgressSteps steps={steps} currentStep={currentStep} />}

      {/* Success Message */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)} 
        />
      )}

      {/* General errors, shown if no specific item is being processed for nutrition */}
      {error && !selectedFoodForNutrition && !nutritionResults && <div className="alert alert-danger">{error}</div>}

      <div className="app-card">
        <div className="app-card-header">
          <h2>Analyze New Meal</h2>
        </div>        <div className="app-card-content">
          {!selectedFile && <SmartUserGuide step="upload" userExperience={userExperience} onDismiss={() => handleGuideDismiss('upload')} onVideoWatch={handleVideoWatch} />}
          
          <div className="form-input-group">
            <label htmlFor="mealPhoto">Upload Meal Photo:</label>
            <input type="file" id="mealPhoto" className="form-input" accept="image/*" onChange={handlePhotoSelect} />
          </div>

          {imagePreviewUrl && (
            <div className="image-preview-container text-center">
              <img src={imagePreviewUrl} alt="Meal preview" style={{ maxWidth: '300px', maxHeight: '300px', margin: '1rem auto', borderRadius: 'var(--border-radius)' }} />
            </div>
          )}          {selectedFile && !identifiedFoodItems && (
            <button onClick={handleAnalyzeImage} className="btn btn-primary btn-block" disabled={loading && !identifiedFoodItems}>
              {/* Show "Analyzing Image..." only during the initial image analysis phase */}
              {loading && !identifiedFoodItems && !selectedFoodForNutrition ? 'Analyzing Image...' : 'Analyze Image'}
            </button>          )}

          {loading && !identifiedFoodItems && <SmartUserGuide step="analyze" userExperience={userExperience} onDismiss={() => handleGuideDismiss('analyze')} onVideoWatch={handleVideoWatch} />}
        </div>
      </div>      {/* Section to display identified food items and allow selection for nutrition */} 
      {identifiedFoodItems && identifiedFoodItems.length > 0 && (        <div className="app-card food-items-selection-card">
          <div className="app-card-header">
            <h3>Identified Food Items</h3>
            <p>Select an item to get its nutritional information and add it to your meal.</p>
          </div>
          <div className="app-card-content">
            <ul className="food-items-list">              {identifiedFoodItems.map((item, index) => { // item is IdentifiedFoodItem with food name and estimated grams
                const isCurrentItemSelectedForDetails = selectedFoodForNutrition === item.food;
                
                // Check if nutrition for a food matching this Gemini item name is in our meal map
                // This is a simple check; more robust matching might be needed if names vary wildly
                const foodInMealMap = Array.from(fetchedNutritionForAllItems.values()).find(fi => 
                  fi.food.toLowerCase() === item.food.toLowerCase() || 
                  item.food.toLowerCase().includes(fi.food.toLowerCase()) || 
                  fi.food.toLowerCase().includes(item.food.toLowerCase())
                );
                const isNutritionAddedToMeal = !!foodInMealMap;

                let buttonText = 'Get Nutrition / Add to Meal';
                if (loading && isCurrentItemSelectedForDetails && !nutritionResults) { 
                  buttonText = 'Fetching...';
                } else if (isCurrentItemSelectedForDetails && nutritionResults) {
                  // Details for this specific Gemini item are shown
                  buttonText = `Details for ${nutritionResults.food} Shown`;
                } else if (isNutritionAddedToMeal) {
                  buttonText = `${foodInMealMap!.food} Added to Meal`;
                }                return (
                  <li key={index} className={`food-item ${isCurrentItemSelectedForDetails ? 'selected-item' : ''} ${isNutritionAddedToMeal ? 'item-in-meal' : ''}`}>                    <div className="food-item-header">
                      <span className="food-item-name">{item.food} (~{item.estimatedGrams}g)</span>
                      <div className="food-item-actions">
                        <button 
                          onClick={async () => {
                            setSelectedFoodForNutrition(item.food); // Mark this Gemini item as selected for detail view
                            await fetchNutritionForFoodItem(item.food, item.estimatedGrams); // Fetch/re-fetch its nutrition with estimated amount
                          }} 
                          className={`btn btn-sm ${isNutritionAddedToMeal ? (isCurrentItemSelectedForDetails && nutritionResults ? 'btn-success' : 'btn-info') : 'btn-outline-primary'}`}
                          disabled={loading && isCurrentItemSelectedForDetails && !nutritionResults} 
                        >
                          {buttonText}
                        </button>
                        
                        {/* Food Correction Button */}
                        <button
                          onClick={() => handleCorrectionRequest(item.food)}
                          className="btn btn-sm btn-outline-warning correction-btn"
                          title={`Correct "${item.food}" if AI misidentified it`}
                          disabled={loading}
                        >
                          ✏️ Correct
                        </button>
                      </div>
                    </div>{/* Display nutrition results if this item is selected, not loading, and has data */} 
                    {isCurrentItemSelectedForDetails && !loading && nutritionResults && (
                      <div className="nutrition-details-section">
                        <h4>Nutrition for: {nutritionResults.food}</h4>
                          {/* Amount Input Field */}
                        <div className="form-input-group">
                          <label htmlFor={`amount-${item}`}>Amount (grams):</label>
                          <div className="input-with-button">
                            <input 
                              type="number" 
                              id={`amount-${item}`}
                              className="form-input"
                              value={amountInputValue}
                              onChange={(e) => {
                                setAmountInputValue(e.target.value);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const newAmount = parseFloat(amountInputValue) || 100;
                                  handleAmountChange(nutritionResults.food, newAmount);
                                }
                              }}
                              onBlur={() => {
                                const newAmount = parseFloat(amountInputValue) || 100;
                                handleAmountChange(nutritionResults.food, newAmount);
                              }}
                              min="1"
                              step="1"
                              placeholder="100"
                            />
                            <button 
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const newAmount = parseFloat(amountInputValue) || 100;
                                handleAmountChange(nutritionResults.food, newAmount);
                              }}
                              style={{ marginLeft: '8px' }}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                        
                        <p><strong>Calories:</strong> {nutritionResults.calories} kcal (per {nutritionResults.amount}g)</p>
                        <p><strong>Macros:</strong></p>
                        <ul>
                          <li>Protein: {nutritionResults.macros.protein}g</li>
                          <li>Carbs: {nutritionResults.macros.carbs}g</li>
                          <li>Fat: {nutritionResults.macros.fat}g</li>
                          {nutritionResults.macros.fibre !== undefined && <li>Fibre: {nutritionResults.macros.fibre}g</li>}
                          {nutritionResults.macros.water !== undefined && <li>Water: {nutritionResults.macros.water}ml</li>}
                        </ul>
                      </div>
                    )}
                    {/* Display error if fetching nutrition for THIS item failed */} 
                    {isCurrentItemSelectedForDetails && error && !nutritionResults && (
                        <div className="alert alert-warning item-error" style={{marginTop: '10px'}}>
                            Error fetching details for "{item.food}": {error}
                        </div>
                    )}
                  </li>
                );              })}
            </ul>
              {fetchedNutritionForAllItems.size === 0 && <SmartUserGuide step="nutrition" userExperience={userExperience} onDismiss={() => handleGuideDismiss('nutrition')} onVideoWatch={handleVideoWatch} />}
          </div>
        </div>
      )}

      {/* Food Correction Interface */}
      {showCorrectionInterface && (
        <div className="app-card food-correction-card">
          <div className="app-card-header">
            <h3>Correct Food Identification</h3>
            <p>AI identified "{correctionTargetFood}" - search for the correct food name below:</p>
          </div>
          <div className="app-card-content">
            <div className="correction-search-section">
              <div className="form-input-group">
                <label htmlFor="correctionSearch">Search for correct food:</label>
                <div className="search-input-container">
                  <input
                    type="text"
                    id="correctionSearch"
                    className="form-input"
                    value={correctedFoodName}
                    onChange={(e) => {
                      setCorrectedFoodName(e.target.value);
                      handleCorrectionSearch(e.target.value);
                    }}
                    placeholder="e.g., Heck sausages, specific brand name..."
                    disabled={loading}
                  />
                  {isSearching && <div className="search-spinner">🔍</div>}
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>Search Results:</h4>
                  <ul className="correction-results-list">
                    {searchResults.map((food: FatSecretFoodResult, index: number) => (
                      <li key={index} className="correction-result-item">
                        <div className="result-info">
                          <strong>{food.food_name}</strong>
                          <p className="text-muted text-sm">{food.food_description}</p>
                        </div>
                        <button
                          onClick={() => handleApplyCorrection(food)}
                          className="btn btn-sm btn-primary"
                          disabled={loading}
                        >
                          Use This
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {correctedFoodName.trim() && searchResults.length === 0 && !isSearching && (
                <div className="no-results">
                  <p className="text-muted">No results found for "{correctedFoodName}". Try a different search term.</p>
                </div>
              )}
            </div>
            
            <div className="correction-actions">
              <button
                onClick={handleCancelCorrection}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}{/* Section for Combined Meal Summary and Logging Action */}
      {fetchedNutritionForAllItems.size > 0 && (        <div className="app-card log-meal-action-card">
          <div className="app-card-header">
            <h3>Meal Summary</h3>
          </div>          <div className="app-card-content">
            {/* Food data appears first */}
            <ul className="meal-summary-list">
              {Array.from(fetchedNutritionForAllItems.values()).map(itemNutr => (
                <li key={itemNutr.food} className="meal-summary-item">
                  {editingMealItem === itemNutr.food ? (
                    // Edit mode
                    <div className="meal-item-edit-form">
                      <div className="edit-form-header">
                        <h5>Edit: {itemNutr.food}</h5>
                      </div>
                      <div className="edit-form-grid">
                        <div className="form-input-group">
                          <label htmlFor="editMealFood">Food Name:</label>
                          <input
                            type="text"
                            id="editMealFood"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.food || ''}
                            onChange={(e) => handleMealItemFieldChange('food', e.target.value)}
                          />
                        </div>
                        <div className="form-input-group">
                          <label htmlFor="editMealAmount">Amount (g):</label>
                          <input
                            type="number"
                            id="editMealAmount"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.amount || 100}
                            onChange={(e) => handleMealItemFieldChange('amount', e.target.value)}
                            min="1"
                            step="1"
                          />
                        </div>
                        <div className="form-input-group">
                          <label htmlFor="editMealCalories">Calories:</label>
                          <input
                            type="number"
                            id="editMealCalories"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.calories || 0}
                            onChange={(e) => handleMealItemFieldChange('calories', e.target.value)}
                            min="0"
                            step="1"
                          />
                        </div>
                        <div className="form-input-group">
                          <label htmlFor="editMealProtein">Protein (g):</label>
                          <input
                            type="number"
                            id="editMealProtein"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.macros.protein || 0}
                            onChange={(e) => handleMealItemFieldChange('macros.protein', e.target.value)}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-input-group">
                          <label htmlFor="editMealCarbs">Carbs (g):</label>
                          <input
                            type="number"
                            id="editMealCarbs"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.macros.carbs || 0}
                            onChange={(e) => handleMealItemFieldChange('macros.carbs', e.target.value)}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-input-group">
                          <label htmlFor="editMealFat">Fat (g):</label>
                          <input
                            type="number"
                            id="editMealFat"
                            className="form-input form-input-sm"
                            value={editingMealItemData?.macros.fat || 0}
                            onChange={(e) => handleMealItemFieldChange('macros.fat', e.target.value)}
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <div className="edit-form-actions">
                        <button
                          onClick={handleSaveMealItemEdit}
                          className="btn btn-success btn-sm"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelMealItemEdit}
                          className="btn btn-secondary btn-sm"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="meal-item-display">
                      <div className="meal-item-info">
                        <div className="meal-item-main">
                          <strong className="meal-item-name">{itemNutr.food}</strong>
                          <span className="meal-item-calories">{itemNutr.calories} kcal</span>
                          {itemNutr.amount !== 100 && (
                            <span className="meal-item-amount">({itemNutr.amount}g)</span>
                          )}
                        </div>
                        <div className="meal-item-macros">
                          P: {itemNutr.macros.protein}g, C: {itemNutr.macros.carbs}g, F: {itemNutr.macros.fat}g
                          {itemNutr.macros.fibre && `, Fib: ${itemNutr.macros.fibre}g`}
                          {itemNutr.macros.water && `, H₂O: ${itemNutr.macros.water}ml`}
                        </div>
                      </div>
                      <div className="meal-item-actions">
                        <button
                          onClick={() => handleEditMealItem(itemNutr.food)}
                          className="btn btn-outline-primary btn-sm"
                          disabled={loading || editingMealItem !== null}
                          title="Edit this food item"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${itemNutr.food}" from your meal?`)) {
                              handleRemoveMealItem(itemNutr.food);
                            }
                          }}
                          className="btn btn-outline-danger btn-sm"
                          disabled={loading || editingMealItem !== null}
                          title="Remove this food item"
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <hr /><p>
              <strong>Total Meal Calories: {Array.from(fetchedNutritionForAllItems.values()).reduce((sum, item) => sum + item.calories, 0)} kcal</strong>
            </p>
            
            {/* User guidance provided by SmartUserGuide component */}
            <SmartUserGuide step="log" userExperience={userExperience} onDismiss={() => handleGuideDismiss('log')} onVideoWatch={handleVideoWatch} />
            
            <button onClick={handleLogCombinedMeal} className="btn btn-primary btn-block" disabled={loading}>
              {loading && fetchedNutritionForAllItems.size > 0 ? 'Logging Combined Meal...' : 'Log Combined Meal'}
            </button>
          </div>
        </div>
      )}

      {/* Daily Log Section - Moved below the meal summary and log button */} 
      <div className="app-card daily-log-card">
        <div className="app-card-header">
          <h2>Today's Log ({selectedDate})</h2>
        </div>
        <div className="app-card-content">
          <div className="form-input-group date-selector-group">
            <label htmlFor="logDate">Select Date:</label>
            <input 
              type="date" 
              id="logDate" 
              className="form-input"
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>          {loading && !loggedFoods.length && (
            <LoadingSpinner message="Loading your meal logs..." />
          )}

          {!loading && loggedFoods.length === 0 && (
            <div className="empty-state">
              <p>No meals logged for this date yet.</p>
            </div>
          )}

          {loggedFoods.length > 0 && (
            <ul className="logged-food-list">
              {loggedFoods.map((entry) => (
                <li key={entry.id} className="logged-food-item app-card">
                  {editEntryId === entry.id && editNutrition ? (
                    <div className="edit-form app-card-content">
                      <h4>Edit Meal</h4>
                      <div className="form-input-group">
                        <label htmlFor="editFoodName">Food Name:</label>
                        <input type="text" id="editFoodName" className="form-input" value={editNutrition.food} onChange={(e) => handleEditNutritionChange('food', e.target.value)} />
                      </div>                      <div className="form-input-group">
                        <label htmlFor="editAmount">Amount (grams):</label>
                        <input type="number" id="editAmount" className="form-input" value={editNutrition.amount || 100} onChange={(e) => handleEditNutritionChange('amount', e.target.value)} min="1" step="1" />
                      </div>
                      <div className="form-input-group">
                        <label htmlFor="editCalories">Calories (kcal):</label>
                        <input type="number" id="editCalories" className="form-input" value={editNutrition.calories} onChange={(e) => handleEditNutritionChange('calories', e.target.value)} />
                      </div>
                      <div className="form-input-group">
                        <label htmlFor="editProtein">Protein (g):</label>
                        <input type="number" id="editProtein" className="form-input" value={editNutrition.macros.protein} onChange={(e) => handleEditNutritionChange('macros.protein', e.target.value)} />
                      </div>
                      <div className="form-input-group">
                        <label htmlFor="editCarbs">Carbs (g):</label>
                        <input type="number" id="editCarbs" className="form-input" value={editNutrition.macros.carbs} onChange={(e) => handleEditNutritionChange('macros.carbs', e.target.value)} />
                      </div>
                      <div className="form-input-group">
                        <label htmlFor="editFat">Fat (g):</label>
                        <input type="number" id="editFat" className="form-input" value={editNutrition.macros.fat} onChange={(e) => handleEditNutritionChange('macros.fat', e.target.value)} />
                      </div>
                      {/* Add inputs for fibre and water if needed */}
                      <div className="button-group horizontal justify-end">
                        <button onClick={handleSaveEdit} className="btn btn-success btn-sm" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                        <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
                      </div>
                    </div>
                  ) : (                    <div className="app-card-content">
                      <div className="food-details">
                        <strong>{entry.food}</strong> - {entry.calories} kcal ({entry.amount || 100}g)
                        <p className="text-muted text-sm">
                          P: {entry.macros.protein}g, C: {entry.macros.carbs}g, F: {entry.macros.fat}g
                          {entry.macros.fibre && `, Fib: ${entry.macros.fibre}g`}
                          {entry.macros.water && `, H₂O: ${entry.macros.water}ml`}
                        </p>
                      </div>
                      <div className="button-group horizontal">
                        <button onClick={() => handleEditFood(entry)} className="btn btn-secondary btn-sm" disabled={loading}>Edit</button>
                        <button onClick={() => handleDeleteFood(entry.id)} className="btn btn-danger btn-sm" disabled={loading}>Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadFood;
