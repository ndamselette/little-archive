# Little Archive — Cloudinary uploads (images + audio)

The admin dashboard now uploads directly to **Cloudinary** and saves the resulting HTTPS URL in your existing Supabase `archive_entries.metadata` fields. Supabase Storage is **not used**. No database migration is needed.

## 1. Configure Cloudinary

1. Create or open your Cloudinary account at https://cloudinary.com/console.
2. Copy your **Cloud name** (NOT your API secret).
3. In Cloudinary Settings > Upload > Upload presets, create an **Unsigned** preset for images, and another **Unsigned** preset for audio/video. Dashboard labels may vary. Configure each preset's allowed formats, file-size limits and folder as needed. Make sure audio uploads are allowed for your plan and account.
4. Edit `js/admin.js` near the top and replace:
   - `YOUR_CLOUD_NAME` with your cloud name
   - `YOUR_IMAGE_UNSIGNED_PRESET` with the image preset name
   - `YOUR_AUDIO_UNSIGNED_PRESET` with the audio/video preset name
5. Deploy the updated website. Sign in to `admin.html`, choose a file, wait for success, then click **Save entry**.

## How it works

Images upload to Cloudinary's `/image/upload` endpoint. MP3/WAV/OGG/M4A upload to `/video/upload` (Cloudinary classifies audio as video assets). The returned `secure_url` is saved in Supabase as `metadata.image_path` or `metadata.src` when you save an entry. Existing paths and manually pasted URLs still work.

## Security and important limitations

**Unsigned upload presets are public**: anyone who discovers the preset and cloud name may be able to upload, even if your admin page requires Supabase login. Restrict formats, sizes and folders in Cloudinary, monitor usage, and consider a server-side authenticated signing endpoint for production. **Never put your Cloudinary API secret in client-side JavaScript.**

Cloudinary plan limits and audio delivery restrictions may apply. Test MP3 playback after uploading; some accounts may restrict delivery of audio/video. The UI allows up to 10 MB per image and 50 MB per audio file, but your preset/account may impose lower limits. Uploading does not save the entry automatically. Deleting an entry does not delete the Cloudinary file. Upload only audio you have rights to distribute.

The existing `supabase/storage_setup.sql` file, if present in an earlier ZIP, is **not needed** for this version.
