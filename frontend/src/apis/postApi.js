export const likeOrUnlikePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/like/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      return { error: error.message };
    }
  };
  
  export const commentOnPost = async (postId, text) => {
    try {
      const response = await fetch(`/api/posts/comment/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      return response.json();
    } catch (error) {
      console.error("Error commenting on post:", error);
      return { error: error.message };
    }
  };
  

  export const createPost = async (userId, caption, image) => {
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postedBy: userId, caption, image }),
      });
      const data = await res.json();
      if (res.status === 201) {
        return { success: true, post: data };
      } else {
        return { success: false, error: data.error || "Failed to create post." };
      }
    } catch (error) {
      return { success: false, error: "An error occurred. Please try again." };
    }
  };

  
export const deletePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      throw new Error('Failed to delete post');
    }
  };

  // utils/fetchPosts.js
export const fetchPosts = async (username, user) => {
    if (!user) return [];
  
    // Don't fetch posts for private accounts
    if (user.private) {
      return [];
    }
  
    try {
      const response = await fetch(`/api/posts/user/${username}`);
      const data = await response.json();
  
      if (response.ok) {
        return data.posts || [];
      } else {
        throw new Error(data.error || 'Failed to fetch posts');
      }
    } catch (error) {
      throw new Error(error.message || 'An error occurred while fetching posts');
    }
  };

  export const fetchPost = async (id) => {
      console.log('Fetching post', id);
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err) {
      throw new Error(err.message || 'An error occurred while fetching the post');
    }
  };

  export const getFeedPosts = async () => {
    try {
      const res = await fetch('/api/posts/feed');
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        return data.posts;
      } else {
        throw new Error(data.error || 'Failed to fetch posts');
      }
    } catch (error) {
      throw new Error(error.message || 'An error occurred while fetching posts');
    }
  };
  
  // utils/api.js
export const fetchNotifications = async () => {
  try {
    const response = await fetch("/api/posts/notifications");
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error fetching notifications");
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`/api/posts/mark-notification-as-read/${notificationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to mark as read");

    return notificationId;
  } catch (error) {
    throw new Error(error.message || "Error marking notification as read");
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await fetch(`/api/posts/comment/${postId}/${commentId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete comment");

    return commentId;
  } catch (error) {
    throw new Error(error.message || "Error deleting comment");
  }
}
