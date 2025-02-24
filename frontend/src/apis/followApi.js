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
export const requestFollow = async (requestedUserId, currentUserId) => {
  try {
      console.log("Sending follow request to:", requestedUserId, "from user:", currentUserId);

      const response = await fetch(`/api/followUsers/follow/${requestedUserId}/request`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId: currentUserId }) 
      });

      const data = await response.json();

      console.log("Response received:", data);

      if (!response.ok) throw new Error(data.message || "Request failed");
      return data;
  } catch (error) {
      console.error("Error sending follow request:", error);
      return { error: error?.message || error?.response?.data?.message || "Unknown error occurred" };
  }
};


// Accept a follow request
export const acceptFollow = async (currentUserId, senderUserId) => {
  try {
      const response = await fetch(`/api/followUsers/follow/${currentUserId}/accept`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: senderUserId }), // Send userId in body
      });

      return await response.json();
  } catch (error) {
      console.error("Error accepting follow request:", error);
      return { error: "Something went wrong" };
  }
};

export const rejectFollow = async (currentUserId, senderUserId) => {
  try {
    if (!currentUserId || !senderUserId) {
      return { error: "Missing required user IDs" };
    }

    const response = await fetch(`/api/followUsers/follow/${currentUserId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: senderUserId }),
    });

    const data = await response.json();
    
    // If we get a 400 with "No follow request" message, handle it gracefully
    // This just means the request was already handled, so we can consider it successful
    if (!response.ok) {
      if (response.status === 400 && data.message && data.message.includes("No follow request")) {
        console.log("Request already handled:", data.message);
        return { message: "Request already handled" };
      }
      
      return { 
        error: data.message || `Server error: ${response.status}`
      };
    }

    return data;
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    return { error: "Something went wrong" };
  }
};