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
  console.log(myBooks);

  // creating the structure
  const ul = document.createElement("ul");
  ul.classList.add("card-list");

  myBooks.forEach((book) => {
    const li = document.createElement("li");
    // const thumbnail = document.createElement("img");
    const cardRightContents = document.createElement("div");
    const title = document.createElement("h3");
    // const description = document.createElement("p");

    li.classList.add("card");

    cardRightContents.classList.add("card-right-contents");

    // if (
    //   book.volumeInfo.imageLinks &&
    //   book.volumeInfo.imageLinks.smallThumbnail
    // ) {
    //   thumbnail.src = book.volumeInfo.imageLinks.smallThumbnail;
    // } else {
    //   thumbnail.src =
    //     "https://www.jennybeaumont.com/wp-content/uploads/2015/03/placeholder.gif";
    // }

    // thumbnail.classList.add("book-thumbnail");

    title.innerText = book.title;
    title.classList.add("book-title");

    // description.innerText = book.volumeInfo.description;
    // description.classList.add("book-description");

    // li.appendChild(thumbnail);
    cardRightContents.appendChild(title);
    // cardRightContents.appendChild(description);
    li.appendChild(cardRightContents);
    ul.appendChild(li);
  });
  results.appendChild(ul);
};

showMyBooks();
