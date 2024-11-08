const profUserID = document
  .querySelector('meta[name="profileuser-id"]')
  .getAttribute("content");
const authUserID = document.querySelector('meta[name="authuser-id"]').content;
const csrfToken = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

let currentPage = 1; // Track current page
let posts = []; // Declare posts globally
let loading = false; // Flag to prevent multiple fetches
let hasNext = false; // To know if there is a next page
let hasPrevious = false; // To know if there is a previous page

postsmap = {};

document.addEventListener("DOMContentLoaded", function () {
  AddPost();
  loadPosts(currentPage); // Load posts for the current page

  // Event listener for Next and Previous buttons
  document.getElementById("nextPage").addEventListener("click", function () {
    if (hasNext) {
      currentPage++;
      loadPosts(currentPage);
    }
  });

  document
    .getElementById("previousPage")
    .addEventListener("click", function () {
      if (hasPrevious && currentPage > 1) {
        currentPage--;
        loadPosts(currentPage);
      }
    });
   
});

function loadPosts(page) {
  if (loading) return; // Prevent multiple simultaneous fetches
  loading = true;

  fetch(`load-posts/?page=${page}`) // Fetch posts for the given page
    .then((response) => response.json())
    .then((data) => {
      posts = data.posts; // Store posts from the response
      hasNext = data.has_next; // Set pagination flags
      hasPrevious = data.has_previous;
      displayPosts(posts); // Display posts for the current page

      // Show/Hide pagination buttons based on available pages
      document.getElementById("nextPage").style.display = hasNext
        ? "block"
        : "none";
      document.getElementById("previousPage").style.display = hasPrevious
        ? "block"
        : "none";

      loading = false; // Reset loading flag
    })
    .catch((error) => {
      console.error("Error loading posts:", error);
      loading = false;
    });
}

function displayPosts(posts) {
  let postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = ""; // Clear existing posts

  posts.forEach((post) => {
    postsmap[post.id] = post;
    const isLikedClass = post.is_liked ? "liked" : "";
    const btnLike = post.is_liked ? "fas" : "far"// for Like Icon
    const itsHim = post.user_id == authUserID ? "btnEdit" : "notShow";

    const postElement = document.createElement("div");
    postElement.className = "card my-3 post";
    postElement.id = `post-${post.id}`;
    postElement.innerHTML = `
          <div class="card-body p-3">
            <div class="row">
              <div class="col-md-6">
            <h4 class="card-title mb-1"> <a href="/profile/${post.user_id}">${post.username}</a></h4>
              </div>
              <div class="col-md-6"> <button class=" ${itsHim}" id='editbtn-${post.id}' onclick='clickEdit(${post.id})' >  Edit Post</button></div>
             </div>
            <p class="card-text text-muted small mb-2">${post.timestamp}</p>
            <div class="content-div mb-3">
              <p class="card-text content">${post.content}</p>
            </div>
         
                <button class="btn  like-button p-0  ${isLikedClass}" id='${post.id}' onclick='like(${post.id})' > ${post.like_count} <i class="${btnLike} fa-heart"></i> Like</button>
           
              
              
            </div>
        `;
    postsDiv.appendChild(postElement);
  });
}

function appendPost(post) {
  postsmap[post.id] = post;
  const itsHim = post.user_id == authUserID ? "btnEdit" : "notShow";
  const postsContainer = document.getElementById("posts");
  const postElement = document.createElement("div");
  postElement.className = "card my-3 post";
  postElement.id = `post-${post.id}`;
  postElement.innerHTML = `
           <div class="card-body p-3">
            <div class="row">
              <div class="col-md-6">
            <h4 class="card-title mb-1"> <a href="/profile/${post.user_id}">${post.username}</a></h4>
              </div>
              <div class="col-md-6"> <button class=" ${itsHim}" id='editbtn-${post.id}' onclick='clickEdit(${post.id})' >  Edit Post</button></div>
             </div>
            <p class="card-text text-muted small mb-2">${post.timestamp}</p>
            <div class="content-div mb-3">
              <p class="card-text content">${post.content}</p>
            </div>
         
                <button class="btn  like-button p-0 " id='${post.id}' onclick='like(${post.id})' > ${post.like_count} <i class="far fa-heart"></i> Like</button>
           
              
              
            </div>
        `;
  postsContainer.prepend(postElement); // Add the new post to the top of the posts container
}

function AddPost() {
  document
    .getElementById("addPost")
    .addEventListener("click", function (event) {
      event.preventDefault();
      const content = document.getElementById("newpost").value;

      fetch("create-post/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrfToken,
        },
        body: new URLSearchParams({
          content: content,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            document.getElementById("newpost").value = "";
            appendPost(data.post); // Append the new post to the top
          } else {
            console.log("Failed to create post");
          }
        })
        .catch((error) => {
          console.error("Error creating post:", error);
        });
    });
}
function like(post_id) {
  fetch(`like/${post_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ post_id: post_id }),
  })
    .then((response) => response.json())
    .then((data) => {
      likebtn = document.getElementById(`${post_id}`);
      
      if (data.liked) {
        likebtn.classList.add("liked");
        likebtn.innerHTML = `${data.like_count} <i class="fas fa-heart"></i> Like`;
      } else {
        likebtn.classList.remove("liked");
        likebtn.innerHTML = `${data.like_count} <i class="far fa-heart"></i> Like`;
      }
    })
    .catch((error) => console.error("Error", error));
}
function clickEdit(post_id) {
  const post = postsmap[post_id];
  postDiv = document.getElementById(`post-${post_id}`);
  postDiv.innerHTML = `
          <div class="card-body p-3">
           <h4 class="card-title mb-1"> <a href="/profile/${post.user_id}">${post.username}</a></h4>
           <p class="card-text text-muted small mb-2">${post.timestamp}</p>
           <div class="content-div mb-3">
            <textarea id = 'txtarea-${post.id}' >${post.content} </textarea>
           </div>
           <button class="saveBtn" id='save-${post.id}' onclick='savePost(${post.id})' >  Save Post</button>
          </div>`;
  const txtArea = document.getElementById(`txtarea-${post.id}`);
  txtArea.focus();
}
function savePost(postId) {
  newContent = document.getElementById(`txtarea-${postId}`).value;
  fetch("/load-posts/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      newContent: newContent,
      postId: postId,
    }),
  })
    .then((response) => {
      if (response.status === 204) {
        loadPosts(currentPage);
      } else {
        response.json().then((data) => {
          alert(`Error: ${data.error}`);
        });
      }
    })
    .catch((error) => console.error("Error:", error));
}
