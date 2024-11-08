import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import *
from django.shortcuts import *
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        full_name = request.POST["Full_name"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, full_name)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
@require_POST
def createPost(request):
    content = request.POST.get("content", "").strip()
    if content:
        newPost = Post.objects.create(user=request.user, content=content)
        response_data = {
            "success": True,
            "post": {
                "id": newPost.id,
                "user_id" : newPost.user.id,
                "username": newPost.user.username,
                "content": content,
                "like_count": newPost.like_count(),
                "timestamp": newPost.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            },
        }
    else:
        response_data = {"success": False, "errors": "Content cannot be empty"}
    return JsonResponse(response_data)


def loadPosts(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        postId = data.get("postId")
        newContent = data.get("newContent")
        post = Post.objects.get(pk=postId)
        if newContent is not None :
            post.content = newContent
            post.save()
            return HttpResponse(status = 204, content=newContent)
        else :
            return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
        

    if request.method == "GET":
        posts = Post.objects.all().order_by("-timestamp")

        # Pagination logic: Get the page number from the request, default is 1
        page_number = request.GET.get("page", 1)
        paginator = Paginator(posts, 10)  # Display 10 posts per page

        # Get posts for the specific page
        page_obj = paginator.get_page(page_number)

        # Serialize the post data for the current page
        posts_data = [
            {
                "id": post.id,
                "user_id": post.user.id,
                "username": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "like_count": post.like_count(),
                "is_liked": post.likes.filter(id=request.user.id).exists(),
            }
            for post in page_obj
        ]

        # Return serialized posts and pagination info (next/previous page availability)
        return JsonResponse(
            {
                "posts": posts_data,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
                "current_page": page_obj.number,
            },
            safe=False,
        )

    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)


def Profile(request, user_id):
    user = get_object_or_404(User, id=user_id)

    return render(
        request, "network/profil.html", {"profile_user": user, "authuser": request.user}
    )


@login_required
def ProfileData(request, user_id):
    profile_user = get_object_or_404(User, id=user_id)

    if request.method == "GET":
        # Fetch all posts by the user
        posts = Post.objects.filter(user=profile_user).order_by("-timestamp")
        posts_data = [
            {
                 "id": post.id,
                "user_id": post.user.id,
                "username": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "like_count": post.like_count(),
                "is_liked": post.likes.filter(id=request.user.id).exists(),
            }
            for post in posts
        ]

        # Check if the authenticated user is following the profile user
        is_following = profile_user.followers.filter(id=request.user.id).exists()

        # Prepare data to send back
        data = {
            "posts": posts_data,
            "followingCount": profile_user.following_count,
            "followersCount": profile_user.followers_count,
            "isFollowing": is_following,
        }

        return JsonResponse(data)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)


def follow_unfollow(request, user_id):
    if request.method == "POST":
        profile_user = get_object_or_404(User, id=user_id)
        current_user = request.user

        if current_user == profile_user:
            return JsonResponse({"error": "You cannot follow yourself."}, status=400)

        if profile_user.followers.filter(id=current_user.id).exists():
            profile_user.followers.remove(current_user)  # Unfollow
            is_following = False
        else:
            profile_user.followers.add(current_user)  # Follow
            is_following = True

        return JsonResponse(
            {
                "isFollowing": is_following,
                "followersCount": profile_user.followers.count(),
            }
        )
    return JsonResponse({"error": "Invalid request method."}, status=400)

def following(request):
    return render(request,'network/following.html')

def followingPosts(request):
    following_users = request.user.following.all()
    posts = Post.objects.filter(user__in=following_users).order_by("-timestamp")
    page_number = request.GET.get('page', 1)
    paginator = Paginator(posts, 10)
    page_obj = paginator.page(page_number)
    posts_data = [
            {
                "id": post.id,
                "user_id": post.user.id,
                "username": post.user.username,
                "content": post.content,
                "timestamp": post.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "like_count": post.like_count(),
                "is_liked": post.likes.filter(id=request.user.id).exists(),
            }
            for post in page_obj.object_list
        ]
        
       
    data = {
            'posts': posts_data,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
        }
        
    return JsonResponse(data)
def like(request,postId):
    post = get_object_or_404(Post,id = postId)
    user = request.user
    
    if request.method == 'POST':
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked =True
    

        return JsonResponse({
        'liked':liked,
        'like_count':post.likes.count()})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=400)

