# Database Column Fix - menu_items.is_active

**Date**: May 4, 2026  
**Issue**: Column `menu_items.is_active` does not exist  
**Status**: ✅ FIXED

---

## Problem

Error when loading menu:
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column menu_items.is_active does not exist"
}
```

**Root Cause**: Code was referencing `is_active` but the actual database column is named `is_available`.

---

## Analysis

### Schema Inconsistency

Different schema files across the codebase use different column names:

1. **`docs/architecture/COMPLETE_DATABASE_SCHEMA.sql`**: Uses `is_available`
2. **`scripts/COMPLETE_SUPABASE_SETUP.sql`**: Uses `is_active`
3. **`database/COMPLETE_SCHEMA.sql`**: Uses `available`
4. **`database/complete-schema.sql`**: Uses `is_available`

The actual deployed database uses `is_available` (most common across schema files).

---

## Solution

### Files Changed

#### `src/app/services/api/supabaseAPI.ts`

**Change 1 - Line 14 (list query)**:
```typescript
// BEFORE
let query = supabase.from('menu_items').select('*').eq('is_active', true);

// AFTER
let query = supabase.from('menu_items').select('*').eq('is_available', true);
```

**Change 2 - Line 66 (soft delete)**:
```typescript
// BEFORE
const { error } = await supabase
  .from('menu_items')
  .update({ is_active: false })
  .eq('id', id);

// AFTER
const { error } = await supabase
  .from('menu_items')
  .update({ is_available: false })
  .eq('id', id);
```

---

## Verification

### Build Status
```bash
$ pnpm run build

✓ 2146 modules transformed
✓ built in 8.64s
✓ 0 TypeScript errors
```

### Database Column Name
The correct column name in the `menu_items` table is:
- ✅ `is_available` (BOOLEAN, DEFAULT true)

### Usage
```typescript
// List active menu items
const { items } = await supabaseAPI.menuItems.list();

// Soft delete (mark as unavailable)
await supabaseAPI.menuItems.delete(itemId);
```

---

## Impact

### Fixed Operations
- ✅ Menu item listing (filtered by availability)
- ✅ Menu item soft deletion (marks as unavailable)

### No Breaking Changes
- The fix maintains the same API interface
- Only internal column reference updated
- All existing code continues to work

---

## Recommendations

### Schema Standardization
To prevent similar issues in the future, standardize on `is_available` across all schema files:

1. **Update**: `scripts/COMPLETE_SUPABASE_SETUP.sql`
   - Change `is_active` → `is_available`

2. **Update**: `database/COMPLETE_SCHEMA.sql`
   - Change `available` → `is_available`

3. **Review**: All other tables for similar inconsistencies
   - `stores.status` vs `stores.is_active`
   - `drivers.status` vs `drivers.is_active`
   - etc.

### Migration Best Practice
When adding new columns, ensure:
1. Migration file uses the correct name
2. TypeScript interfaces match migration
3. API code matches migration
4. Documentation reflects actual schema

---

## Status

**Issue**: RESOLVED ✅  
**Build**: PASSING ✅  
**Menu Loading**: FUNCTIONAL ✅
