# Importing example archive entries

1. In Supabase, open **Table Editor → `archive_entries` → Import data from CSV**.
2. Select `archive_entries_example.csv`.
3. Map columns to the matching table columns: `section`, `title`, `description`, `metadata`, `tags`, `sort_order`, and `is_published`.
4. Import the example rows, then replace or edit the examples from `admin.html`.

The rows are deliberately generic examples, including a book example. For books, keep `section=movies` and set `metadata.type` to `Book`; add `author`, `year`, `genres`, and `image_path` as needed. Place book covers in `assets/images/archive/books/`, for example `assets/images/archive/books/1.png`. Replace them with your own content. For songs, upload MP3s to `assets/music/` in your GitHub repository and set `metadata.src` to the relative path, for example `assets/music/my-song.mp3`. The file must actually exist at that path after deployment.

`metadata` must be valid JSON. `tags` is a PostgreSQL text array in CSV form, such as `{Fantasy,Drama}`. Leave `id`, `created_at`, and `updated_at` out so PostgreSQL can generate them/default them.
