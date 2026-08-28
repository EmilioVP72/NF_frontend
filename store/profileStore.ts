import { create } from 'zustand';

interface Profile {
  id?: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name_paternal?: string;
  last_name_maternal?: string;
  role?: string;
  avatar_url?: string;
  age?: number | string;
  height_cm?: number | string;
  weight_kg?: number | string;
  target_weight_kg?: number | string;
  goal?: string;
  profile_completed?: boolean;
  liked_foods?: string[];
  disliked_foods?: string[];
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (token: string) => Promise<void>;
  updateProfile: (token: string, data: Partial<Profile>) => Promise<boolean>;
  completeOnboarding: (token: string, data: any) => Promise<boolean>;
  uploadAvatar: (token: string, formData: FormData) => Promise<boolean>;
}

const API_URL = 'http://localhost:3000/api/v1/profiles';

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

  fetchProfile: async (token: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        set({ profile: data.data });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (token: string, data: Partial<Profile>) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success && result.data) {
        set({ profile: result.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  completeOnboarding: async (token: string, data: any) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/me/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success && result.data) {
        set({ profile: result.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (token: string, formData: FormData) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData para subir archivo
      });
      const result = await response.json();
      if (result.success && result.data?.avatar_url) {
        set((state) => ({
          profile: state.profile ? { ...state.profile, avatar_url: result.data.avatar_url } : null,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));
