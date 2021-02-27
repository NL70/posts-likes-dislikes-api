const results = document.getElementById("results");

let myBooks = [];

const fetchMyBooks = async () => {
  const response = await fetch(`http://localhost:3002/books`);
  const responseJson = await response.json();
  myBooks = responseJson.data;
};

const showMyBooks = async () => {
  // clearHTML
  results.innerHTML = "";

  await fetchMyBooks();

  // creating the structure
  const ul = document.createElement("ul");
  ul.classList.add("card-list");

  myBooks.forEach((book) => {
    const li = document.createElement("li");
    const card = document.createElement("div");
    const title = document.createElement("h3");
    const author = document.createElement("p");
    const cardButton = document.createElement("button");

    li.classList.add("card");
    cardButton.classList.add("card-button", "card-delete-button");
    cardButton.innerText = "Delete Book";

    card.classList.add("card-right-contents");

    title.innerText = book.title;
    title.classList.add("book-title");

    author.innerText = book.author;

    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(cardButton);
    li.appendChild(card);
    ul.appendChild(li);
  });
  results.appendChild(ul);
};

showMyBooks();
