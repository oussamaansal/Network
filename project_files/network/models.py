from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    followers = models.ManyToManyField(
        "self", symmetrical=False, related_name="following", blank=True
    )

    @property
    def following_count(self):
        return self.following.count()

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_users(self):
        return self.following.all()

    @property
    def followers_users(self):
        return self.followers.all()

    pass


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    
    def like_count(self):
        return self.likes.count()
