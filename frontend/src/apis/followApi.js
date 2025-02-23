export const followUser = async (userId) => {
  try {
    // Get auth token from localStorage or your auth context
    const token = localStorage.getItem('authToken'); // Adjust based on your auth implementation
    
    const response = await fetch(`/api/followUsers/follow/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      throw new Error("Failed to parse JSON response from server.");
    }
  } catch (error) {
    console.error("Follow API error:", error);
    throw error;
  }
};


  // apiService.js

export const followUnfollowUserDialog = async (userId) => {
  try {
    const response = await fetch("/api/followUsers/followUnfollowDialog", {
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
    const response = await fetch(`/api/followUsers/follow-unfollow/${userId}`, {
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


// Send a follow request
export const requestFollow = async (requestedUserId, token) => {
    try {
        const response = await fetch(`/api/followUsers/follow/${requestedUserId}/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return await response.json();
    } catch (error) {
        console.error("Error sending follow request:", error);
        return { error: "Something went wrong" };
    }
};

// Accept a follow request
export const acceptFollow = async (senderUserId, token) => {
    try {
        const response = await fetch(`/api/followUsers/follow/${senderUserId}/accept`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return await response.json();
    } catch (error) {
        console.error("Error accepting follow request:", error);
        return { error: "Something went wrong" };
    }
};

// Reject a follow request
export const rejectFollow = async (senderUserId, token) => {
    try {
        const response = await fetch(`/api/followUsers/follow/${senderUserId}/reject`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return await response.json();
    } catch (error) {
        console.error("Error rejecting follow request:", error);
        return { error: "Something went wrong" };
    }
};
