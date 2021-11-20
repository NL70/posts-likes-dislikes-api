CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE books (
  ID SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users (id) NOT NULL
);

INSERT INTO books (author, title)
VALUES  ('J.K. Rowling', 'Harry Potter');
