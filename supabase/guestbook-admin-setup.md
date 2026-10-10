Little Archive — Admin guestbook approval setup

The combined admin page preserves the latest archive form (including Books, Movie/Series/Book type, genres, and picture preview) and adds guestbook moderation.

Before using approval controls:
1. In Supabase Authentication → Users, create/use your private admin account and copy its User UID.
2. Open `supabase/archive_entries.sql` and `supabase/guestbook.sql`. Replace every `REPLACE_WITH_ADMIN_AUTH_USER_UUID` placeholder with that exact UID in both files.
3. Run the SQL in the Supabase SQL Editor. If you have already run these scripts, rerunning the provided policies is intended to replace the named policies, but review the SQL before execution.
4. Sign in to `admin.html` using that Supabase Auth account. The guestbook panel will show pending notes and let you approve, reject, move back to pending, or delete them.

Security note: the admin page is not a substitute for database security. The SQL limits authenticated moderation to the admin UID and leaves public visitors able to submit pending notes and read approved notes only. Never put a Supabase service-role/secret key in browser JavaScript; the site should use only the publishable/anon key.
