from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-post/", views.createPost, name="createPost"),
    path('following/', views.following, name='following'),
    
    path('profile/<int:user_id>', views.Profile, name='profile'),
    #APIS
    path("load-posts/", views.loadPosts, name="laodPosts"),
    path("profile-data/<int:user_id>", views.ProfileData, name="profileData"),
    path('follow-unfollow/<int:user_id>/', views.follow_unfollow, name='follow_unfollow'),
    path('following-posts/', views.followingPosts, name='following_posts'),
    path('like/<int:postId>',views.like,name='like')
]
