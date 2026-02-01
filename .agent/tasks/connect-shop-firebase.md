# Task: Connect Shop Page to Firebase with Real-time Updates and Server-side Filtering

This plan outlines the steps to connect the `zwebsite` Shop page to the Firestore database, enabling real-time updates and efficient server-side filtering.

## 1. Analysis Summary
- **Current State**: `ProductContext.tsx` uses static data. `ProductService.ts` has Firebase methods but they aren't fully integrated into the UI.
- **Goals**:
    - Implement real-time updates using `onSnapshot`.
    - Implement Firestore-level filtering for better performance (Categories/Subcategories).
    - Ensure data consistency between `zadmin` and `zwebsite`.

## 2. Proposed Changes

### Phase 1: Service Layer Enhancement (`src/services/product-service.ts`)
- Refine existing Firebase methods to handle real-time subscriptions more robustly.
- Add specific query methods for category and subcategory filtering to avoid loading all products when only a segment is needed.

### Phase 2: Context Update (`src/contexts/product-context.tsx`)
- Replace static data loading with `ProductService.subscribeToProducts`.
- Manage state for current filters and update the subscription/query based on these filters.
- Maintain a loading state and error handling.

### Phase 3: UI Integration (`src/app/shop/page.tsx`)
- Ensure the Shop page correctly uses the `loading` state from `ProductContext`.
- Optimize the filter logic to leverage the new context-level filtering (or let the context handle the heavy lifting).

## 3. Detailed Steps

### Step 1: Update Product Service
- Add `subscribeToProductsFiltered` which takes category and subcategory as optional parameters.
- Ensure `normalizeProduct` handles all fields provided by `zadmin` (description, sizes, rating, etc.).

### Step 2: Update Product Context
- Modify `ProductProvider` to manage the active subscription.
- Expose methods to update category/subcategory filters.

### Step 3: Update Shop Page
- Refactor `filteredProducts` logic to work with the data provided by the Context.

## 4. Verification Plan
- **Manual Audit**: Check if additions in `zadmin` appear immediately on the Shop page.
- **Lint Check**: Run `npx tsc --noEmit` to ensure no type regressions.
- **UI Test**: Verify filters (Category, Price, Search) still work as expected with live data.
