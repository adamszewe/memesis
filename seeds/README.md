# Database Seeds

This directory contains seed data for development purposes.

## Usage

To seed your development database with sample posts:

```bash
go run seeds/seed.go
```

**Note:** This will clear all existing posts and insert sample data.

## Files

- `dev_posts.sql` - Sample meme posts for development
- `seed.go` - Go script to execute the seed files

## Adding More Seeds

To add more seed data:

1. Create new SQL files (e.g., `dev_users.sql`, `dev_comments.sql`)
2. Add corresponding `INSERT` statements
3. Update `seed.go` to execute the new seed files

## Important

- These seeds are for **development only**
- Never run seeds in production
- Seeds will `TRUNCATE` tables before inserting data
