# Network Project

A social network web application that allows users to create posts, follow other users, and like posts. Built using Python, Django, JavaScript, HTML, and CSS, this project was completed as part of the CS50 Web Programming course. It includes several key social network features, including profile pages, following, pagination, post editing, and real-time "like" toggling.

## Features

### 1. New Post
- **Signed-in users** can create a new post by entering text in a text area and clicking a submit button.
- The "New Post" form is located on the "All Posts" page, but can be placed on a separate page if desired.

### 2. All Posts
- The **All Posts** page displays all user posts in reverse chronological order (most recent first).
- Each post shows:
  - Username of the poster
  - Post content
  - Timestamp (date and time of posting)
  - Number of likes (default is 0)

### 3. Profile Page
- Clicking on a username directs the user to that person’s profile page.
- The profile page displays:
  - **Number of followers** the user has
  - **Number of people** the user is following
  - All posts by the user in reverse chronological order
- If the logged-in user is viewing another user’s profile, they will see a **Follow/Unfollow** button to manage their following list.
- Users cannot follow themselves.

### 4. Following Page
- A **Following** link in the navigation bar takes the user to a page that displays all posts by users they are following.
- This page behaves like the "All Posts" page but with only the posts of followed users.
- Only available to signed-in users.

### 5. Pagination
- All pages displaying posts (e.g., All Posts, Profile Page, Following Page) support **pagination**.
- Posts are displayed 10 at a time.
- If there are more than 10 posts, a **Next** button allows the user to load older posts, and a **Previous** button allows navigation back.

### 6. Edit Post
- Users can edit their own posts via an **Edit** button.
- Clicking the Edit button replaces the post content with a textarea for editing.
- Users can save the edited post without reloading the page (handled with JavaScript).
- **Security**: Users can only edit their own posts, preventing unauthorized edits.

### 7. Like and Unlike
- Users can **like or unlike** any post by clicking a button.
- JavaScript updates the like count asynchronously, so the page does not need to reload.
- The server updates the like count, and the front-end displays the updated number immediately.

## Technologies Used
- **Python (Django)**: Backend and application framework
- **JavaScript**: Handles asynchronous post updates (e.g., liking and editing posts)
- **HTML & CSS**: Frontend structure and styling

## Getting Started

### Prerequisites
- Python 3.x
- Django


