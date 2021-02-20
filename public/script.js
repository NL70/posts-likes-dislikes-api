const search_input = document.getElementById("search");
const results = document.getElementById("results");

let search_term = "";
let books = [];
let booksCount;

const fetchBooks = async () => {
  if (!search_term) {
    return;
  }

  const response = await fetch(
    `https://rocky-mountain-35341.herokuapp.com/google_books?q=${search_term}`
  );
  const responseJson = await response.json();
  books = responseJson.items;
  booksCount = responseJson.totalItems;
};

const addBook = async (book) => {
  await fetch(`http://localhost:3002/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });
};

const showBooks = async () => {
  // clearHTML
  results.innerHTML = "";

  await fetchBooks();

  // creating the structure
  const ul = document.createElement("ul");
  ul.classList.add("card-list");

  books.forEach((book) => {
    const li = document.createElement("li");
    const thumbnail = document.createElement("img");
    const cardBody = document.createElement("div");
    const cardRightContents = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const cardAddButton = document.createElement("button");

    li.classList.add("card");
    cardBody.classList.add("card-body");
    cardRightContents.classList.add("card-right-contents");

    cardAddButton.classList.add("card-add-button");
    cardAddButton.innerText = "Add Book";
    cardAddButton.onclick = async () => {
      const authors = book.volumeInfo.authors
        ? book.volumeInfo.authors.join(", ")
        : "Unknown author";
      const title = book.volumeInfo.title;
      const bookData = { author: authors, title: title };
      await addBook(bookData);
    };

    if (
      book.volumeInfo.imageLinks &&
      book.volumeInfo.imageLinks.smallThumbnail
    ) {
      thumbnail.src = book.volumeInfo.imageLinks.smallThumbnail;
    } else {
      thumbnail.src =
        "https://www.jennybeaumont.com/wp-content/uploads/2015/03/placeholder.gif";
    }

    thumbnail.classList.add("book-thumbnail");

    title.innerText = book.volumeInfo.title;
    title.classList.add("book-title");

    description.innerText = book.volumeInfo.description || "No description";
    description.classList.add("book-description");

    li.appendChild(cardBody);
    li.appendChild(cardAddButton);
    cardBody.appendChild(thumbnail);
    cardRightContents.appendChild(title);
    cardRightContents.appendChild(description);
    cardBody.appendChild(cardRightContents);
    ul.appendChild(li);
  });
  results.appendChild(ul);
};

// display initial books
showBooks();

search_input.addEventListener("input", (e) => {
  search_term = e.target.value;
  // re-display books again based on the new search_term
  showBooks();
});
