-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Constraints
    CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Optional: Full-text search on title/description
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);
