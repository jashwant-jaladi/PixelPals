export const followUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'An error occurred while following the user');
    }
  };

  // apiService.js

export const followUnfollowUserDialog = async (userId) => {
  try {
    const response = await fetch("/api/users/followUnfollowDialog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Follow/unfollow failed");
    }

    return response.json();
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    throw error;
  }
};


export const fetchFollowersAndFollowing = async (userId) => {
  try {
    const response = await fetch(`/api/users/follow-unfollow/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return {
      followers: data.followers,
      following: data.following,
    };
  } catch (error) {
    throw new Error("Error fetching followers and following");
  }
};
