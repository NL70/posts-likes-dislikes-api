-- post_likes_dislikes_api

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users (id) NOT NULL
);

CREATE TABLE likes (
  post_id UUID REFERENCES posts (id) NOT NULL,
  user_id UUID REFERENCES users (id) NOT NULL,
  UNIQUE (post_id, user_id)
);

CREATE TABLE dislikes (
  post_id UUID REFERENCES posts (id) NOT NULL,
  user_id UUID REFERENCES users (id) NOT NULL,
  UNIQUE (post_id, user_id)
);

