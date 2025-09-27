# Team Page Dialog Auto-Opening Fix Plan

## Problem Analysis

### Current Symptoms
1. **AlertDialogs are opening immediately on page load**
   - First it was the bulk delete dialog
   - Now it's the individual remove dialog
   - This happens even with defensive conditions

2. **Pattern Recognition**
   - The issue persists across multiple fix attempts
   - Adding conditions to `open` prop doesn't fully prevent it
   - This suggests the root cause is NOT in the dialog conditions

## Root Cause Investigation

### Hypothesis 1: State Contamination
- Previous state might be persisting across navigations
- React Query or other state management could be caching bad state

### Hypothesis 2: Component Double-Mounting
- React StrictMode causes components to mount twice in development
- This could trigger race conditions with state initialization

### Hypothesis 3: Parent Component Issues
- The parent component (`team-management-page.tsx`) might be passing props that trigger the dialogs
- Event handlers might be firing on mount

### Hypothesis 4: Radix UI AlertDialog Bug
- There might be a specific issue with how Radix AlertDialog handles the `open` prop
- The `onOpenChange` callback might be firing unexpectedly

## Diagnostic Steps

### Step 1: Add Console Logging
Add detailed logging to understand the lifecycle:
```typescript
console.log('[TeamMembersList] Component mounted');
console.log('[TeamMembersList] showRemoveDialog:', showRemoveDialog);
console.log('[TeamMembersList] selectedMember:', selectedMember);
console.log('[TeamMembersList] isLoading:', isLoading);
```

### Step 2: Check Parent Component
Examine `team-management-page.tsx` for any props or state that could trigger dialogs

### Step 3: Isolate the Issue
Create a minimal test component to verify if the issue is with our implementation or Radix UI

## Implementation Plan

### Phase 1: Emergency Fix (Immediate)
**Goal**: Stop dialogs from appearing on page load

1. **Force dialogs to be closed initially**
   ```typescript
   const [showRemoveDialog, setShowRemoveDialog] = useState(false);
   const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
   ```

2. **Add mounting flag**
   ```typescript
   const [isMounted, setIsMounted] = useState(false);
   
   useEffect(() => {
     setIsMounted(true);
     return () => setIsMounted(false);
   }, []);
   ```

3. **Only allow dialogs after mounting**
   ```typescript
   open={isMounted && showRemoveDialog && selectedMember !== null}
   ```

### Phase 2: Clean Implementation (Proper Fix)

1. **Create a custom hook for dialog management**
   ```typescript
   function useDialogState<T>() {
     const [isOpen, setIsOpen] = useState(false);
     const [data, setData] = useState<T | null>(null);
     
     const open = useCallback((item: T) => {
       setData(item);
       setIsOpen(true);
     }, []);
     
     const close = useCallback(() => {
       setIsOpen(false);
       setData(null);
     }, []);
     
     return { isOpen, data, open, close };
   }
   ```

2. **Use the custom hook in the component**
   ```typescript
   const removeDialog = useDialogState<TeamMember>();
   ```

3. **Update dialog implementation**
   ```typescript
   <AlertDialog open={removeDialog.isOpen} onOpenChange={removeDialog.close}>
   ```

### Phase 3: Verification

1. **Test on different routes**
   - Navigate to team page from dashboard
   - Navigate to team page from direct URL
   - Refresh the page

2. **Test dialog functionality**
   - Ensure dialogs open when clicked
   - Ensure dialogs close properly
   - Ensure no phantom dialogs appear

## Alternative Solution: Controlled Dialog Component

If the above doesn't work, create a wrapper component:

```typescript
function SafeAlertDialog({ 
  trigger, 
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ensure dialog starts closed
  useEffect(() => {
    setIsOpen(false);
  }, []);
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Implementation Order

1. **First**: Add diagnostic logging
2. **Second**: Implement mounting flag fix
3. **Third**: Test thoroughly
4. **Fourth**: If still broken, implement custom hook solution
5. **Fifth**: If all else fails, use the SafeAlertDialog wrapper

## Success Criteria

- [ ] No dialogs appear on page load
- [ ] Dialogs open correctly when triggered
- [ ] Dialogs close properly
- [ ] No console errors
- [ ] Works in both dev and production modes

## Notes for Junior Developer

1. **Start with logging** - Understanding what's happening is crucial
2. **Test after each change** - Don't make multiple changes at once
3. **Use React DevTools** - Check component state in the browser
4. **Clear browser cache** - Sometimes old state persists
5. **Check Network tab** - Ensure APIs are returning expected data
