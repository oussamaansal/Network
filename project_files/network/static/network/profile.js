const profUserID = document.querySelector('meta[name="profileuser-id"]').getAttribute('content');
const authUserID = document.querySelector('meta[name="authuser-id"]').getAttribute('content');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const followBtn = document.getElementById('follow-btn');
const followersCountElem = document.getElementById('followers');
const followingCountElem = document.getElementById('following');
postsmap = {};
document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
    followBtn.addEventListener("click", function () {
        handleFollowUnfollow();
    });

})
function loadProfile(){
    if(profUserID == authUserID){
        followBtn.style.display='none'
    }
    
        fetch(`/profile-data/${profUserID}`).then(response =>response.json().then(data =>{

            followBtn.className= data.isFollowing ? "unfollow-btn" : "follow-btn"
            followBtn.innerHTML = data.isFollowing ? 'Unfollow' : 'Follow';
            followersCountElem.innerText = data.followersCount;
            followingCountElem.innerText = data.followingCount;
            
            displayPosts(data.posts);
       
       
       
           }));
    



    
}
function handleFollowUnfollow() {
    fetch(`/follow-unfollow/${profUserID}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }

        followBtn.className= data.isFollowing ? "unfollow-btn" : "follow-btn"
        followBtn.innerText = data.isFollowing ? 'Unfollow' : 'Follow';
        followersCountElem.innerText = data.followersCount;
    })
    .catch(error => {
        console.error('Error:', error);
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
          
          loadProfile();
        } else {
          response.json().then((data) => {
            alert(`Error: ${data.error}`);
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }