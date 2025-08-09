
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Plan = 'free' | 'pro';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isProUser: boolean;
  plan: Plan;
  updatePlan: (newPlan: Plan) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isProUser: false,
  plan: 'free',
  updatePlan: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // User is logged in, fetch their plan from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setPlan(userDoc.data().plan as Plan);
        } else {
          // This case is for users who signed up before Firestore was implemented
          // or if the doc creation failed on signup.
          await setDoc(userDocRef, { plan: 'free' });
          setPlan('free');
        }
      } else {
        // User is logged out, reset plan to free
        setPlan('free');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updatePlan = async (newPlan: Plan) => {
    if (!user) return;
    setPlan(newPlan); // Update local state immediately for instant UI feedback
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, { plan: newPlan }, { merge: true });
    } catch (error) {
        console.error("Error updating plan in Firestore: ", error);
        // Optionally revert local state if DB update fails
    }
  };

  const isProUser = plan === 'pro';

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Skeleton className="h-8 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24 hidden md:block" />
              <Skeleton className="h-8 w-24 hidden md:block" />
              <Skeleton className="h-8 w-24 hidden md:block" />
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  const value = { user, loading, isProUser, plan, updatePlan };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
