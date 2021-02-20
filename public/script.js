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
    const cardRightContents = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");

    li.classList.add("card");

    cardRightContents.classList.add("card-right-contents");

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

    description.innerText = book.volumeInfo.description;
    description.classList.add("book-description");

    li.appendChild(thumbnail);
    cardRightContents.appendChild(title);
    cardRightContents.appendChild(description);
    li.appendChild(cardRightContents);
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
