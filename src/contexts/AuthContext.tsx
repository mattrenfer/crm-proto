'use client'

// This file is used to create a context for the authentication context
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js"; // types for the user and session objects from supabase
import { createClient } from "@/lib/supabase/client";

// The Context (Box that holds the data)
type AuthContextType = {
    user: User | null // the user object from supabase
    session: Session | null // the session object from supabase
    loading: boolean // whether the user is loading
    signOut: () => Promise<void> // Logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// The Provider (Wraps the app and provides the data to the app)
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // on mount, check if the user is already logged in
        const supabase = createClient()

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // listen for auth changes (login, logout)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}