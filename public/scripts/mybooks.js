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
    const cardRightContents = document.createElement("div");
    const title = document.createElement("h3");
    const author = document.createElement("p");

    li.classList.add("card");

    cardRightContents.classList.add("card-right-contents");

    title.innerText = book.title;
    title.classList.add("book-title");

    author.innerText = book.author;

    cardRightContents.appendChild(title);
    cardRightContents.appendChild(author);
    li.appendChild(cardRightContents);
    ul.appendChild(li);
  });
  results.appendChild(ul);
};

showMyBooks();
