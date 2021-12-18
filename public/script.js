// const search_input = document.getElementById("search");
// const results = document.getElementById("results");

// let search_term = "";

console.log("SCRIPT RUNNING");
let posts = [];
const form = document.getElementById("login-form");
const username = document.getElementById("username");
const password = document.getElementById("password");
let usernameValue = "";
const usernameDisplay = document.getElementById("username-display");
const apiUrl = "https://posts-likes-dislikes-api.herokuapp.com/";
const title = document.getElementById("title");
const content = document.getElementById("content");
const createForm = document.getElementById("create-form");

const login = async (user) => {
  const response = await fetch(`${apiUrl}login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (response.status === 201) {
    const responseJson = await response.json();
    console.log(responseJson.data.username);
    localStorage.setItem("username", responseJson.data.username);
    window.location.href = "/";
  }
};

if (usernameDisplay) {
  usernameDisplay.innerText = localStorage.getItem("username");
}

const handleSubmit = async (event) => {
  //   console.log("submit form");
  //   console.log(username.value);
  //   console.log(password.value);
  event.preventDefault();
  await login({
    username: username.value,
    password: password.value,
  });
};

const handleCreatePost = async (event) => {
  //   console.log("submit form");
  //   console.log(username.value);
  //   console.log(password.value);
  event.preventDefault();
  await createPost({
    title: title.value,
    content: content.value,
  });
  window.location.href = "/";
};

const createPost = async (post) => {
  const response = await fetch(`${apiUrl}posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (createForm) {
  createForm.addEventListener("submit", handleCreatePost);
}

const fetchPosts = async () => {
  const response = await fetch(`${apiUrl}posts`);
  const responseJson = await response.json();
  console.log("e");
  posts = responseJson.data;
  // console.log(responseJson.data);
};

const showPosts = async () => {
  await fetchPosts();

  const cardsWrapper = document.getElementById("cards-wrapper");
  if (!cardsWrapper) {
    return;
  }
  posts.forEach((element, index) => {
    console.log(element);
    const card = document.createElement("div");
    card.classList.add("card");

    const heading = document.createElement("h2");
    heading.classList.add("heading");

    const content = document.createElement("p");
    content.classList.add("content");

    const likesDislikesContainer = document.createElement("div");
    likesDislikesContainer.classList.add("likes-dislikes");

    const likesContainer = document.createElement("div");
    likesContainer.classList.add("likes-dislikes-individual");

    let likesSymbol = document.createElement("span");
    likesSymbol.innerText = "\u2191";

    const likesCount = document.createElement("p");
    likesCount.classList.add("content");
    likesCount.classList.add("likes-count");

    const dislikesContainer = document.createElement("div");
    dislikesContainer.classList.add("likes-dislikes-individual");

    let dislikesSymbol = document.createElement("span");
    dislikesSymbol.innerText = "\u2193";

    let deleteSymbol = document.createElement("img");
    deleteSymbol.src = "images/delete-button.png";
    deleteSymbol.classList.add("content");
    deleteSymbol.classList.add("delete-button");

    const dislikesCount = document.createElement("p");
    dislikesCount.classList.add("content");

    const leftContainer = document.createElement("div");
    leftContainer.classList.add("left-container");

    const rightContainer = document.createElement("div");

    heading.innerText = element.title;
    content.innerText = element.content;
    likesCount.innerText = element.like_count;
    dislikesCount.innerText = element.dislike_count;

    dislikesContainer.addEventListener("click", async () => {
      if (element.is_disliked) {
        debounce(async () => {
          await deleteDislikes(element, dislikesCount, element.id);
          element.is_disliked = false;
          element.dislike_count -= 1;
        })();
      } else {
        debounce(async () => {
          await addDislikes(element, dislikesCount, element.id);
          element.is_disliked = true;
          element.dislike_count += 1;
        })();
      }
    });

    likesContainer.addEventListener("click", async () => {
      if (element.is_liked) {
        debounce(async () => {
          await deleteLikes(element, likesCount, element.id);
          element.is_liked = false;
          element.like_count -= 1;
        })();
      } else {
        debounce(async () => {
          await addLikes(element, likesCount, element.id);
          element.is_liked = true;
          element.like_count += 1;
        })();
      }
    });

    deleteSymbol.addEventListener("click", async () => {
      await deletePosts(element, element.id);
      card.remove();
    });

    likesContainer.appendChild(likesSymbol);
    likesContainer.appendChild(likesCount);
    dislikesContainer.appendChild(dislikesSymbol);
    dislikesContainer.appendChild(dislikesCount);

    likesDislikesContainer.appendChild(likesContainer);
    likesDislikesContainer.appendChild(dislikesContainer);
    rightContainer.appendChild(deleteSymbol);

    leftContainer.appendChild(heading);
    leftContainer.appendChild(content);
    leftContainer.appendChild(likesDislikesContainer);

    card.appendChild(leftContainer);
    card.appendChild(rightContainer);

    cardsWrapper.appendChild(card);
  });
};

showPosts();

const addLikes = async (element, likesCount, postID) => {
  const response = await fetch(`${apiUrl}posts/${postID}/likes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  if (response.status === 200) {
    likesCount.innerText = parseInt(element.like_count) + 1;
  }
};

const deleteLikes = async (element, likesCount, postID) => {
  const response = await fetch(`${apiUrl}posts/${postID}/likes`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  if (response.status === 204) {
    likesCount.innerText = parseInt(element.like_count) - 1;
  }
};

const addDislikes = async (element, dislikesCount, postID) => {
  const response = await fetch(`${apiUrl}posts/${postID}/dislikes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  if (response.status === 200) {
    dislikesCount.innerText = parseInt(element.dislike_count) + 1;
  }
};

const deleteDislikes = async (element, dislikesCount, postID) => {
  const response = await fetch(`${apiUrl}posts/${postID}/dislikes`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  if (response.status === 204) {
    dislikesCount.innerText = parseInt(element.dislike_count) - 1;
  }
};

const deletePosts = async (element, postID) => {
  await fetch(`${apiUrl}posts/${postID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}
