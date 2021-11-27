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

INSERT INTO users (username, password)
VALUES ('username2', 'password');

INSERT INTO posts (title, content, user_id)
VALUES ('title2', 'content', '83dfac60-1ce5-459c-b3b9-2b714a497140');

INSERT INTO likes (post_id, user_id)
VALUES ('38e78f82-435f-4b7f-9ed0-8d1427440f2c', '83dfac60-1ce5-459c-b3b9-2b714a497140');

SELECT posts.id, title, content, username,
(SELECT COUNT(*) as like_count FROM likes WHERE post_id=posts.id),
(SELECT COUNT(*) as dislike_count FROM dislikes WHERE post_id=posts.id)
FROM posts 
JOIN users
ON posts.user_id = users.id
WHERE posts.id = posts.id;
