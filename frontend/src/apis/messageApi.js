export const sendMessage = async (message, recipientId, img) => {
    try {
      const response = await fetch('/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, recipientId, img }),
      });
  
      if (!response.ok) throw new Error("Failed to send message");
      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };
  
  export const analyzeMood = async (mood, text) => {
    try {
      const response = await fetch('/api/messages/analyzeMood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, text }),
      });
  
      if (!response.ok) throw new Error("Failed to analyze mood");
      return await response.json();
    } catch (error) {
      console.error("Error analyzing mood:", error);
      throw error;
    }
  };
  

  export const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
  
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  
  export const markMessageAsSeen = async (messageId) => {
    try {
      const response = await fetch("/api/messages/mark-seen", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
        credentials: "include", // Ensures cookies (if any) are sent with the request
      });
  
      if (!response.ok) {
        throw new Error("Failed to mark message as seen");
      }
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  };

  export const fetchUnreadCount = async (userId) => {
    try {
      const response = await fetch(`/api/messages/message-seen-count/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data.unreadCount || 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      return 0;
    }
  };
  
  export const markAllMessagesAsSeen = async (token) => {
    try {
      await fetch("/api/messages/mark-all-seen", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
          },
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };
  
  export const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      throw new Error(error.message || 'An error occurred while fetching conversations');
    }
  };