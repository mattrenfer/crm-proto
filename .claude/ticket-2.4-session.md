# Ticket 2.4: Session Management & Context - Progress Notes

**Date Started**: November 28, 2024
**Status**: In Progress - Step 1 Complete (with fixes needed)

---

## What We're Building

Creating a React Context to make authentication state available throughout the entire app without prop drilling.

### The Big Picture
- **Current Problem**: Every page manually checks auth, duplicated code everywhere
- **Solution**: Centralized auth state with React Context that auto-updates all components
- **End Goal**: Any component can use `useAuth()` to access user/session/loading state

---

## Implementation Steps

### ✅ Step 1: Create AuthContext (DONE - needs 2 small fixes)

**File**: `src/contexts/AuthContext.tsx`

**What was implemented:**
- Type definition for `AuthContextType`
- Context creation with `createContext()`
- `AuthProvider` component with:
  - State management (user, session, loading)
  - Initial session check with `getSession()`
  - Auth change listener with `onAuthStateChange()`
  - Subscription cleanup on unmount
- `useAuth()` custom hook for consuming context

**Fixes Needed:**

1. **Line 14** - Add `| undefined` to context type:
```tsx
// Current:
const AuthContext = createContext<AuthContextType>()

// Should be:
const AuthContext = createContext<AuthContextType | undefined>(undefined)
```

2. **Missing `signOut` function** - Add after useEffect (around line 42):
```tsx
const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
}
```

3. **Missing `'use client'` directive** - Add at top of file:
```tsx
'use client'
```

---

### 🔜 Step 2: Create Providers Wrapper

**File**: `src/components/Providers.tsx` (to be created)

**Purpose**: Client Component wrapper to use in Server Component layout

**Implementation**:
```tsx
'use client'

import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

---

### 🔜 Step 3: Update Root Layout

**File**: `src/app/layout.tsx`

**Changes needed**:
- Import `Providers` component
- Wrap existing content with `<Providers>`

---

### 🔜 Step 4: Update Navigation

**File**: `src/components/Navigation.tsx`

**Changes needed**:
- Import and use `useAuth()` hook
- Add conditional rendering for logged-in/logged-out states
- Add logout button with handler
- Display user email when logged in

---

### 🔜 Step 5: Simplify Login Page (Optional)

**File**: `src/app/login/page.tsx`

**Changes**:
- Can optionally use `useAuth()` to check if already logged in
- Context auto-updates after login, so manual state management can be removed

---

### 🔜 Step 6: Test Everything

- [ ] Login → see email in navigation
- [ ] Logout → navigation updates
- [ ] Page refresh → stays logged in
- [ ] Navigation between pages → auth persists
- [ ] DevTools → check for subscription leaks
- [ ] Loading state → no flash of wrong content

---

## Key Concepts Learned

### 1. React Context Pattern
- Sharing state across component tree without prop drilling
- Provider wraps app at top level
- Consumer components use custom hook to access data

### 2. onAuthStateChange Listener
- Real-time listener for ALL auth events (login, logout, token refresh)
- Auto-updates context state when auth changes
- Makes entire app reactive to auth changes

### 3. Loading State Pattern
- Prevents flash of wrong content
- Start with `loading: true`
- Set to `false` after initial check completes
- Components show spinner while loading

### 4. Subscription Cleanup
- Critical to prevent memory leaks
- Return cleanup function from useEffect
- Unsubscribe from listener on unmount

### 5. Client vs Server Component Boundary
- Context requires hooks → must be Client Component
- Root layout is Server Component
- Solution: Client Component "island" (Providers wrapper)

---

## Code Review Notes

### What Was Done Well ✅
- Correct imports (React hooks, Supabase types, browser client)
- Proper TypeScript typing throughout
- Good state initialization values
- Correct use of optional chaining (`session?.user`)
- Nullish coalescing for fallback (`?? null`)
- Proper subscription cleanup pattern
- Clear comments explaining purpose
- Good error message in useAuth hook

### What Needs Improvement ⚠️
- Missing `'use client'` directive (will cause error when used)
- Context type missing `| undefined` (TypeScript issue)
- `signOut` function referenced but never defined (runtime error)

---

## Architecture Overview

```
AuthContext.tsx (creates the context)
       ↓
Providers.tsx (wraps context in client component)
       ↓
layout.tsx (wraps app with Providers)
       ↓
Navigation.tsx (uses useAuth hook)
       ↓
Any component can now use useAuth()!
```

---

## Execution Flow

### App Initialization
1. AuthProvider mounts
2. State: user=null, session=null, loading=true
3. useEffect runs
4. getSession() checks cookies
5. If session exists: update state with user
6. If no session: state stays null
7. loading set to false
8. onAuthStateChange listener starts
9. Components render with current auth state

### User Logs In
1. Login page calls signInWithPassword()
2. Supabase writes tokens to cookies
3. onAuthStateChange fires (event="SIGNED_IN")
4. Context updates: session & user
5. ALL components using useAuth() re-render
6. Navigation shows user email + logout

### User Logs Out
1. Component calls signOut() from context
2. Supabase clears cookies
3. onAuthStateChange fires (event="SIGNED_OUT")
4. Context updates: session=null, user=null
5. ALL components using useAuth() re-render
6. Navigation shows login link

---

## Next Session TODO

1. Apply the 3 fixes to AuthContext.tsx
2. Create Providers.tsx wrapper
3. Update layout.tsx
4. Update Navigation.tsx
5. Test the full flow
6. Commit progress

---

## Questions to Verify Understanding

Before moving forward, ensure you understand:

1. **Why do we need both `getSession()` AND `onAuthStateChange()`?**
   - getSession = initial check on mount (one-time)
   - onAuthStateChange = continuous listener (reactive)

2. **What happens without subscription cleanup?**
   - Memory leak from duplicate listeners
   - Callbacks fire multiple times
   - Performance degradation

3. **Why is the loading state important?**
   - Prevents flash of "logged out" → "logged in" UI
   - Shows spinner during auth check
   - Better UX

4. **Why wrap in Providers component?**
   - Root layout is Server Component
   - Context requires Client Component
   - Providers creates Client Component "island"

---

## Estimated Time Remaining

- Fix AuthContext: 5 minutes
- Create Providers: 5 minutes
- Update Layout: 5 minutes
- Update Navigation: 20 minutes
- Testing: 20 minutes
- **Total**: ~55 minutes

---

**Last Updated**: November 28, 2024
**Next Review**: After applying fixes and creating Providers wrapper
