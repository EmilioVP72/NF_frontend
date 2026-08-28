import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: string | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  initialized: false,
  setSession: (session) => set({ 
    session, 
    user: session?.user || null,
    role: session?.user?.user_metadata?.role || 'CLIENT'
  }),
  setInitialized: (initialized) => set({ initialized }),
}));
