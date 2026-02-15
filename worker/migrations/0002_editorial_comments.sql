ALTER TABLE posts
ADD COLUMN editorial_comments_json TEXT NOT NULL DEFAULT '[]';
