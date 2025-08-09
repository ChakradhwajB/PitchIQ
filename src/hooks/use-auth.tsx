
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isProUser: boolean;
  proTierActivated: boolean;
  setProTierActivated: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true, 
    isProUser: false,
    proTierActivated: false,
    setProTierActivated: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [proTierActivated, setProTierActivated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Reset pro status on logout
        setProTierActivated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // In a real app, this would check against a database (e.g., Firestore)
  // to see if the user has an active subscription.
  // For this demo, we'll just use the state variable.
  const isProUser = !!user && proTierActivated;

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
    )
  }

  const value = { user, loading, isProUser, proTierActivated, setProTierActivated };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
