let currentPage = 1;  
let posts = [];       
let loading = false;  
let hasNext = false;  
let hasPrevious = false;  
const profUserID = document.querySelector('meta[name="profileuser-id"]').getAttribute('content');
const authUserID = document.querySelector('meta[name="authuser-id"]').getAttribute('content');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
postsmap = {};

document.addEventListener("DOMContentLoaded", function () {
  loadPosts(currentPage);  // Load posts for the current page

 
  document.getElementById("nextPage").addEventListener("click", function () {
    if (hasNext) {
      currentPage++;
      loadPosts(currentPage);
    }
  });

  document.getElementById("previousPage").addEventListener("click", function () {
    if (hasPrevious && currentPage > 1) {
      currentPage--;
      loadPosts(currentPage);
    }
  });
});

function loadPosts(page) {
  if (loading) return;  // Prevent multiple simultaneous fetches
  loading = true;

  fetch(`/following-posts/?page=${page}`)  
    .then((response) => response.json())
    .then((data) => {
      posts = data.posts;  
      hasNext = data.has_next;  
      hasPrevious = data.has_previous;
      displayPosts(posts);  

      // Show/Hide pagination buttons based on available pages
      document.getElementById("nextPage").style.display = hasNext ? "block" : "none";
      document.getElementById("previousPage").style.display = hasPrevious ? "block" : "none";

      loading = false;  
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
         
                <button class="btn btn-link like-button p-0  ${isLikedClass}" id='${post.id}' onclick='like(${post.id})' > ${post.like_count} <i class="${btnLike} fa-heart"></i> Like</button>
           
              
              
            </div>
        `;
    postsDiv.appendChild(postElement);
  });
}
  function like(post_id) {
    fetch(`/like/${post_id}`, {
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