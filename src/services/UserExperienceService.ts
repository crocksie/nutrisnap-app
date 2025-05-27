// User Experience Tracking Service
// Tracks user interactions to determine their experience level and adjust guidance accordingly

interface UserActivity {
  mealsLogged: number;
  photosAnalyzed: number;
  lastLogin: string;
  firstLogin: string;
  guideDismissals: string[]; // Array of guide types dismissed
  tutorialVideosWatched: string[];
  totalTimeSpent: number; // in minutes
}

export type UserExperience = 'new' | 'experienced' | 'expert';

export class UserExperienceService {
  private static readonly STORAGE_KEY = 'nutrisnap_user_activity';
  
  // Thresholds for determining user experience level
  private static readonly THRESHOLDS = {
    EXPERIENCED_MEALS: 10,
    EXPERIENCED_PHOTOS: 15,
    EXPERT_MEALS: 50,
    EXPERT_PHOTOS: 75,
    EXPERT_DAYS: 7, // Active for 7+ days
  };

  static getUserActivity(): UserActivity {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse stored user activity:', error);
      }
    }
    
    // Return default activity for new users
    return {
      mealsLogged: 0,
      photosAnalyzed: 0,
      lastLogin: new Date().toISOString(),
      firstLogin: new Date().toISOString(),
      guideDismissals: [],
      tutorialVideosWatched: [],
      totalTimeSpent: 0,
    };
  }

  static saveUserActivity(activity: UserActivity): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activity));
    } catch (error) {
      console.warn('Failed to save user activity:', error);
    }
  }

  static trackMealLogged(): void {
    const activity = this.getUserActivity();
    activity.mealsLogged += 1;
    activity.lastLogin = new Date().toISOString();
    this.saveUserActivity(activity);
  }

  static trackPhotoAnalyzed(): void {
    const activity = this.getUserActivity();
    activity.photosAnalyzed += 1;
    activity.lastLogin = new Date().toISOString();
    this.saveUserActivity(activity);
  }

  static trackGuideDismissed(guideType: string): void {
    const activity = this.getUserActivity();
    if (!activity.guideDismissals.includes(guideType)) {
      activity.guideDismissals.push(guideType);
    }
    this.saveUserActivity(activity);
  }

  static trackTutorialWatched(tutorialId: string): void {
    const activity = this.getUserActivity();
    if (!activity.tutorialVideosWatched.includes(tutorialId)) {
      activity.tutorialVideosWatched.push(tutorialId);
    }
    this.saveUserActivity(activity);
  }

  static trackTimeSpent(minutes: number): void {
    const activity = this.getUserActivity();
    activity.totalTimeSpent += minutes;
    this.saveUserActivity(activity);
  }

  static getUserExperienceLevel(): UserExperience {
    const activity = this.getUserActivity();
    const { EXPERIENCED_MEALS, EXPERIENCED_PHOTOS, EXPERT_MEALS, EXPERT_PHOTOS, EXPERT_DAYS } = this.THRESHOLDS;
    
    // Calculate days since first login
    const firstLogin = new Date(activity.firstLogin);
    const now = new Date();
    const daysSinceFirstLogin = Math.floor((now.getTime() - firstLogin.getTime()) / (1000 * 60 * 60 * 24));

    // Expert user criteria
    if (
      activity.mealsLogged >= EXPERT_MEALS ||
      activity.photosAnalyzed >= EXPERT_PHOTOS ||
      (daysSinceFirstLogin >= EXPERT_DAYS && activity.mealsLogged >= EXPERIENCED_MEALS)
    ) {
      return 'expert';
    }

    // Experienced user criteria
    if (
      activity.mealsLogged >= EXPERIENCED_MEALS ||
      activity.photosAnalyzed >= EXPERIENCED_PHOTOS ||
      activity.guideDismissals.length >= 2 ||
      activity.tutorialVideosWatched.length >= 1
    ) {
      return 'experienced';
    }

    // New user (default)
    return 'new';
  }

  static isGuideDismissed(guideType: string): boolean {
    const activity = this.getUserActivity();
    return activity.guideDismissals.includes(guideType);
  }

  static hasTutorialBeenWatched(tutorialId: string): boolean {
    const activity = this.getUserActivity();
    return activity.tutorialVideosWatched.includes(tutorialId);
  }

  static getActivitySummary() {
    const activity = this.getUserActivity();
    const experienceLevel = this.getUserExperienceLevel();
    
    return {
      ...activity,
      experienceLevel,
      daysSinceFirstLogin: Math.floor(
        (new Date().getTime() - new Date(activity.firstLogin).getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  // Reset user activity (useful for testing or user requested reset)
  static resetUserActivity(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if user should see onboarding
  static shouldShowOnboarding(): boolean {
    const activity = this.getUserActivity();
    return activity.mealsLogged === 0 && activity.photosAnalyzed === 0;
  }

  // Smart guidance recommendations
  static getGuidanceRecommendations(): {
    showVideoFirst: boolean;
    autoExpandDetails: boolean;
    showQuickTipsOnly: boolean;
    suggestAdvancedFeatures: boolean;
  } {
    const experienceLevel = this.getUserExperienceLevel();
    const activity = this.getUserActivity();

    return {
      showVideoFirst: experienceLevel === 'new' && activity.tutorialVideosWatched.length === 0,
      autoExpandDetails: experienceLevel === 'new',
      showQuickTipsOnly: experienceLevel === 'expert',
      suggestAdvancedFeatures: experienceLevel === 'expert' && activity.mealsLogged >= 20,
    };
  }
}

export default UserExperienceService;
