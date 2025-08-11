
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirebase, getDb, getAuthInstance } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Plan = 'free' | 'pro';

interface FirebaseConfig {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

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

export function AuthProvider({ 
    children,
    firebaseConfig,
    recaptchaSiteKey
}: { 
    children: React.ReactNode,
    firebaseConfig: FirebaseConfig,
    recaptchaSiteKey?: string
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    // Initialize Firebase on the client with the config passed from the server layout
    initializeFirebase(firebaseConfig, recaptchaSiteKey);
    const auth = getAuthInstance();
    const db = getDb();

    if (!auth || !db) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setPlan(userDoc.data().plan as Plan);
        } else {
          await setDoc(userDocRef, { plan: 'free' });
          setPlan('free');
        }
      } else {
        setPlan('free');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseConfig, recaptchaSiteKey]);

  const updatePlan = async (newPlan: Plan) => {
    const auth = getAuthInstance();
    const db = getDb();
    if (!auth?.currentUser || !db) return;
    
    setPlan(newPlan);
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
        await setDoc(userDocRef, { plan: newPlan }, { merge: true });
    } catch (error) {
        console.error("Error updating plan in Firestore: ", error);
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
