import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import the Supabase client

// Define an interface for user profile data
interface UserProfile {
  id: string; // Supabase user ID
  email: string;
  username?: string; // Assuming you have a username field in your profiles table
}

function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState(''); // State for username input
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [saving, setSaving] = useState(false); // State for saving process
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false); // State for save success message
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState('');
  const [activity, setActivity] = useState('');
    // Goal setting states - Initialize with empty strings or default values
  const [dailyCalories, setDailyCalories] = useState<number | ''>('');
  const [dailyProtein, setDailyProtein] = useState<number | ''>('');
  const [dailyCarbs, setDailyCarbs] = useState<number | ''>('');
  const [dailyFat, setDailyFat] = useState<number | ''>('');
  const [dailyFiber, setDailyFiber] = useState<number | ''>('');
  const [dailyWater, setDailyWater] = useState<number | ''>('');
  const [weightGoal, setWeightGoal] = useState<number | ''>('');
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain' | ''>('');
  const [savingGoals, setSavingGoals] = useState(false);
  const [saveGoalsSuccess, setSaveGoalsSuccess] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  const activityLevels = [
    { value: '', label: 'Select activity level' },
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Lightly active (light exercise/sports 1-3 days/week)' },
    { value: 'moderate', label: 'Moderately active (moderate exercise/sports 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)' },
    { value: 'very_active', label: 'Very active (very hard exercise & physical job)' },
  ];

  // BMR calculation (Mifflin-St Jeor Equation)
  let bmr = '';
  if (weight && height && age && sex) {
    if (sex === 'male') {
      bmr = (10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5).toFixed(0);
    } else if (sex === 'female') {
      bmr = (10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161).toFixed(0);
    } else {
      bmr = 'N/A';
    }
  }

  useEffect(() => {
    const fetchUserProfileAndGoals = async () => {
      setLoading(true);
      setError(null);
      setGoalsError(null);
      setSaveSuccess(false); // Clear save success message on fetch
      setSaveGoalsSuccess(false);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authUser) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      // Fetch additional profile data and goals from your 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles') // Assuming you have a 'profiles' table
        .select('username, name, dob, weight, height, age, sex, activity, daily_calories, daily_protein, daily_carbs, daily_fat, daily_fiber, daily_water, weight_goal, goal_type') // Select all needed fields including goals
        .eq('id', authUser.id)
        .single(); // Expecting a single row for the user's profile

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
        setError(profileError.message);
      } else if (profileData) {
        const fetchedProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email!,
          username: profileData.username,
        };
        setUserProfile(fetchedProfile);
        setUsername(profileData.username || '');
        setName(profileData.name || '');
        setDob(profileData.dob || '');
        setWeight(profileData.weight || '');
        setHeight(profileData.height || '');        setAge(profileData.age || '');
        setSex(profileData.sex || '');
        setActivity(profileData.activity || '');

        // Populate goal states
        setDailyCalories(profileData.daily_calories || '');
        setDailyProtein(profileData.daily_protein || '');
        setDailyCarbs(profileData.daily_carbs || '');
        setDailyFat(profileData.daily_fat || '');
        setDailyFiber(profileData.daily_fiber || '');
        setDailyWater(profileData.daily_water || '');
        setWeightGoal(profileData.weight_goal || '');
        setGoalType(profileData.goal_type || '');

      } else {
        // User is logged in but no profile found
        const newProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email!,
        };
        setUserProfile(newProfile);
        // Initialize all fields as empty
        setUsername(''); setName(''); setDob(''); setWeight(''); setHeight(''); setAge(''); setSex(''); setActivity('');
        setDailyCalories(''); setDailyProtein(''); setDailyCarbs(''); setDailyFat(''); setDailyFiber(''); setDailyWater(''); setWeightGoal(''); setGoalType('');
        console.warn('No profile found for user. User can create one by saving.');
      }
      setLoading(false);
    };

    fetchUserProfileAndGoals();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSaveProfile = async () => {
    if (!userProfile) {
      setError('Cannot save profile: User data not loaded.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    const updates = {
      id: userProfile.id,
      username: username || null, // Use null for empty string to clear in DB if needed
      name: name || null,
      dob: dob || null,
      weight: weight === '' ? null : weight,
      height: height === '' ? null : height,
      age: age === '' ? null : age,
      sex: sex || null,
      activity: activity || null,
      updated_at: new Date().toISOString(), // Add a timestamp
    };

    const { error: updateError } = await supabase
      .from('profiles') // Assuming your profiles table name
      .upsert([updates], {
        onConflict: 'id', // Update if a profile with this ID exists, insert otherwise
      });

    if (updateError) {
      setError(updateError.message);
      console.error('Error saving profile:', updateError);
    } else {
      // Update the displayed profile data after successful save
      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          username: username || undefined, // Use undefined for empty string in state
        };
      });
      setSaveSuccess(true);
      console.log('Profile saved successfully.');
    }

    setSaving(false);
  };

  const handleSaveGoals = async () => {
    if (!userProfile) {
      setGoalsError('Cannot save goals: User data not loaded.');
      return;
    }

    setSavingGoals(true);
    setGoalsError(null);
    setSaveGoalsSuccess(false);

    const goalUpdates = {
      id: userProfile.id, // Ensure this matches the primary key of your profiles table
      daily_calories: dailyCalories === '' ? null : Number(dailyCalories),
      daily_protein: dailyProtein === '' ? null : Number(dailyProtein),
      daily_carbs: dailyCarbs === '' ? null : Number(dailyCarbs),
      daily_fat: dailyFat === '' ? null : Number(dailyFat),
      daily_fiber: dailyFiber === '' ? null : Number(dailyFiber),
      daily_water: dailyWater === '' ? null : Number(dailyWater),
      weight_goal: weightGoal === '' ? null : Number(weightGoal),
      goal_type: goalType === '' ? null : goalType,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert([goalUpdates], { onConflict: 'id' });

    if (updateError) {
      setGoalsError(updateError.message);
      console.error('Error saving goals:', updateError);
    } else {      setSaveGoalsSuccess(true);
      console.log('Goals saved successfully.');
    }
    setSavingGoals(false);
  };


  return (
    <div className="page-container profile-page">
      <h1 className="text-center">Your Profile & Goals</h1>

      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      )}
      {error && <div className="alert alert-danger">Error: {error}</div>}
      
      {userProfile && (
        <>
          <div className="app-card profile-details-card">
            <div className="app-card-header">
              <h2>Profile Details</h2>
            </div>
            <div className="app-card-content">
              {saveSuccess && <div className="alert alert-success">Profile saved successfully!</div>}
              <div className="form-input-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={userProfile.email} className="form-input" disabled />
              </div>
              <div className="form-input-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>
              <div className="form-input-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="Enter your name" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dob">Date of Birth:</label>
                <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="form-input" />
              </div>
              <div className="form-input-group">
                <label htmlFor="sex">Sex:</label>
                <select id="sex" value={sex} onChange={e => setSex(e.target.value)} className="form-select">
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-input-group">
                <label htmlFor="age">Age:</label>
                <input type="number" id="age" value={age} onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 30" />
              </div>
              <div className="form-input-group">
                <label htmlFor="weight">Weight (kg):</label>
                <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))} className="form-input" min="0" step="0.1" placeholder="e.g. 70.5" />
              </div>
              <div className="form-input-group">
                <label htmlFor="height">Height (cm):</label>
                <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 175" />
              </div>
              <div className="form-input-group">
                <label htmlFor="activity">Activity Level:</label>
                <select id="activity" value={activity} onChange={e => setActivity(e.target.value)} className="form-select">
                  {activityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              {bmr && <p className="text-muted">Estimated BMR: {bmr} calories/day</p>}
              <button onClick={handleSaveProfile} className="btn btn-primary btn-block" disabled={saving || loading}>
                {saving ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="app-card nutritional-goals-card">
            <div className="app-card-header">
              <h2>Nutritional Goals</h2>
            </div>
            <div className="app-card-content">
              {goalsError && <div className="alert alert-danger">Error: {goalsError}</div>}
              {saveGoalsSuccess && <div className="alert alert-success">Goals saved successfully!</div>}
              
              <div className="form-input-group">
                <label htmlFor="goalType">Primary Goal:</label>
                <select id="goalType" value={goalType} onChange={e => setGoalType(e.target.value as typeof goalType)} className="form-select">
                  <option value="">Select Goal</option>
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>
              <div className="form-input-group">
                <label htmlFor="weightGoal">Weight Goal (kg):</label>
                <input type="number" id="weightGoal" value={weightGoal} onChange={e => setWeightGoal(e.target.value === '' ? '' : parseFloat(e.target.value))} className="form-input" min="0" step="0.1" placeholder="e.g. 65.0" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyCalories">Daily Calories (kcal):</label>
                <input type="number" id="dailyCalories" value={dailyCalories} onChange={e => setDailyCalories(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 2000" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyProtein">Daily Protein (g):</label>
                <input type="number" id="dailyProtein" value={dailyProtein} onChange={e => setDailyProtein(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 150" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyCarbs">Daily Carbs (g):</label>
                <input type="number" id="dailyCarbs" value={dailyCarbs} onChange={e => setDailyCarbs(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 250" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyFat">Daily Fat (g):</label>
                <input type="number" id="dailyFat" value={dailyFat} onChange={e => setDailyFat(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 70" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyFiber">Daily Fiber (g):</label>
                <input type="number" id="dailyFiber" value={dailyFiber} onChange={e => setDailyFiber(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 30" />
              </div>
              <div className="form-input-group">
                <label htmlFor="dailyWater">Daily Water (ml):</label>
                <input type="number" id="dailyWater" value={dailyWater} onChange={e => setDailyWater(e.target.value === '' ? '' : parseInt(e.target.value))} className="form-input" min="0" placeholder="e.g. 2000" />
              </div>
              <button onClick={handleSaveGoals} className="btn btn-primary btn-block" disabled={savingGoals || loading}>
                {savingGoals ? 'Saving Goals...' : 'Save Goals'}
              </button>
            </div>
          </div>
        </>
      )}

      {!loading && !userProfile && (
        <div className="app-card">
          <div className="app-card-content text-center">
            <p>Please log in to view and manage your profile.</p>
            {/* Optionally, add a login button/link here if not handled by global auth state */} 
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
