# Supabase Storage Setup Guide

This guide explains how to set up the `avatars` storage bucket in Supabase for user profile pictures.

## Prerequisites

- Supabase project created
- Access to Supabase Dashboard
- Database schema already applied

## Step 1: Create Avatars Bucket

### Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Configure the bucket:
   - **Name:** `avatars`
   - **Public bucket:** ✅ Yes (checked)
   - **File size limit:** `2097152` (2MB in bytes)
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp`
5. Click **"Create bucket"**

### Via SQL (Alternative)

If you prefer SQL, you can create the bucket programmatically:

```sql
-- Insert bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

## Step 2: Configure Storage Policies

After creating the bucket, set up Row Level Security (RLS) policies for access control.

### Via Supabase Dashboard

1. Go to **Storage** > **Policies**
2. Select the `avatars` bucket
3. Click **"New policy"** for each policy below

### Via SQL (Recommended)

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Policy 1: Anyone can view avatars (public read)
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy 2: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Step 3: Verify Setup

### Test Bucket Access

1. Go to **Storage** > **avatars** bucket
2. Try uploading a test image manually
3. Verify you can view the uploaded image
4. Delete the test image

### Test from App

1. Run the Stepin app
2. Go to Profile screen
3. Tap "Edit" button
4. Tap avatar to select/upload image
5. Verify avatar uploads and displays correctly

## File Naming Convention

The app uses this naming convention for avatar files:

```
{user_id}/avatar.{extension}
```

**Example:**
```
123e4567-e89b-12d3-a456-426614174000/avatar.jpg
```

This ensures:
- Each user has their own folder
- Only one avatar per user (overwrites on update)
- Easy to identify and manage files

## Troubleshooting

### Issue: "Bucket not found" error

**Solution:** Verify the bucket name is exactly `avatars` (lowercase, plural)

### Issue: "Permission denied" error

**Solution:** Check that all 4 storage policies are created and enabled

### Issue: Avatar not displaying

**Solution:** 
1. Verify bucket is set to **public**
2. Check the avatar_url in the profiles table
3. Ensure the file exists in storage

### Issue: Upload fails

**Solution:**
1. Check file size is under 2MB
2. Verify file type is JPEG, PNG, or WebP
3. Ensure user is authenticated

## Security Notes

- ✅ Public read access allows avatars to be displayed without authentication
- ✅ Write access is restricted to authenticated users
- ✅ Users can only upload/update/delete their own avatars
- ✅ File size limit prevents abuse
- ✅ MIME type restriction prevents non-image uploads

## Next Steps

After completing this setup:

1. ✅ Bucket created and configured
2. ✅ Policies applied
3. ✅ Test avatar upload from app
4. ✅ Verify avatar displays correctly
5. ✅ Test avatar update/delete functionality

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Upload Best Practices](https://supabase.com/docs/guides/storage/uploads/standard-uploads)

