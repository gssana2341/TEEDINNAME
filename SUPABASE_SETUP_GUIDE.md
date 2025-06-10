# 🚀 Supabase Database Setup Guide

## Quick Setup (Copy & Paste Each Command Separately)

### Step 1: Add view_count column

```sql
ALTER TABLE property_details
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
```

### Step 2: Create increment function

```sql
CREATE OR REPLACE FUNCTION increment_view_count(input_property_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $function$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE property_details
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE property_id = input_property_id
    RETURNING view_count INTO new_count;

    IF new_count IS NULL THEN
        RETURN 0;
    END IF;

    RETURN new_count;
END;
$function$;
```

### Step 3: Create performance index

```sql
CREATE INDEX IF NOT EXISTS idx_property_details_view_count
ON property_details(view_count DESC);
```

### Step 4: Add sample data (optional)

```sql
UPDATE property_details
SET view_count = FLOOR(RANDOM() * 100)::INTEGER
WHERE view_count = 0 OR view_count IS NULL;
```

## 🧪 Test Your Setup

After running the commands above, test with:

```sql
-- Replace 'your-property-id' with a real UUID from your property_details table
SELECT increment_view_count('your-property-id');
```

## 🏷️ Tag Colors System

| Tag      | Color     | View Requirement |
| -------- | --------- | ---------------- |
| ให้เช่า  | 🟢 Green  | Any              |
| ขาย      | 🔵 Blue   | Any              |
| แนะนำ    | 🟠 Orange | >= 50 views      |
| Top Pick | 🟡 Yellow | Any              |

## 📊 How It Works

1. User clicks on property card → API call to `/api/track-view`
2. API calls `increment_view_count()` function
3. Database updates `view_count` in `property_details` table
4. Frontend checks if `viewCount >= 50` → Shows "แนะนำ" tag

## 🔧 Troubleshooting

**If you get errors:**

1. **Column already exists** → Skip Step 1, continue with Step 2
2. **Function exists** → The REPLACE will update it automatically
3. **No property_details table** → Check your table name in Supabase
4. **UUID format error** → Make sure property_id column is UUID type

**Check your table structure:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'property_details';
```
