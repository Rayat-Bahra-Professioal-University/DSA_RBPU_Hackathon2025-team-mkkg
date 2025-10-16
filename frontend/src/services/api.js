import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Custom hook to create an authenticated API client
 * Uses Clerk's auth token for all requests
 */
export function useApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const createHeaders = async () => {
    // Wait for Clerk to be loaded
    if (!isLoaded) {
      throw new Error("Authentication is still loading. Please wait...");
    }

    if (!isSignedIn) {
      throw new Error("You must be signed in to perform this action");
    }

    try {
      const token = await getToken();
      return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw new Error("Failed to get authentication token. Please try again.");
    }
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || error.message || "Request failed");
    }
    return response.json();
  };

  return {
    // Get all complaints with optional filters
    async getComplaints(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/complaints${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Get complaint statistics
    async getComplaintStats(userId = null) {
      const url = `${API_BASE_URL}/complaints/stats${
        userId ? `?userId=${userId}` : ""
      }`;
      const response = await fetch(url, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Get current user's complaints
    async getMyComplaints(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/complaints/my${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Get a single complaint by ID
    async getComplaint(id) {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Create a new complaint
    async createComplaint(data) {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    // Update a complaint
    async updateComplaint(id, data) {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: "PUT",
        headers: await createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    // Delete a complaint
    async deleteComplaint(id) {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Upload a single file
    async uploadFile(file) {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    },

    // Upload multiple files
    async uploadFiles(files) {
      const token = await getToken();
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_BASE_URL}/uploads/multiple`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      const result = await handleResponse(response);
      // Backend returns { files: [...] }, extract the array
      return result.files || [];
    },

    // ===== ADMIN ENDPOINTS =====

    // Get admin statistics
    async getAdminStats() {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Get all complaints (admin view)
    async getAdminComplaints(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/admin/complaints${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Update complaint status (admin)
    async updateComplaintStatus(
      id,
      status,
      adminNote = null,
      resolutionPhotos = null
    ) {
      const body = { status };
      if (adminNote) body.adminNote = adminNote;
      if (resolutionPhotos) body.resolutionPhotos = resolutionPhotos;

      const response = await fetch(
        `${API_BASE_URL}/admin/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: await createHeaders(),
          body: JSON.stringify(body),
        }
      );
      return handleResponse(response);
    },

    // Assign complaint to admin
    async assignComplaint(id, assignedTo = null) {
      const response = await fetch(
        `${API_BASE_URL}/admin/complaints/${id}/assign`,
        {
          method: "PATCH",
          headers: await createHeaders(),
          body: JSON.stringify({ assignedTo }),
        }
      );
      return handleResponse(response);
    },

    // Bulk update complaints (admin)
    async bulkUpdateComplaints(ids, status, adminNote = null) {
      const response = await fetch(
        `${API_BASE_URL}/admin/complaints/bulk-update`,
        {
          method: "POST",
          headers: await createHeaders(),
          body: JSON.stringify({ ids, status, adminNote }),
        }
      );
      return handleResponse(response);
    },

    // Delete complaint (admin)
    async deleteComplaintAdmin(id, permanent = false) {
      const response = await fetch(
        `${API_BASE_URL}/admin/complaints/${id}?permanent=${permanent}`,
        {
          method: "DELETE",
          headers: await createHeaders(),
        }
      );
      return handleResponse(response);
    },

    // ===== ADMIN MANAGEMENT ENDPOINTS =====

    // Get all admins
    async getAdmins() {
      const response = await fetch(`${API_BASE_URL}/admin/admins`, {
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },

    // Create a new admin
    async createAdmin(email) {
      const response = await fetch(`${API_BASE_URL}/admin/admins`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    // Remove admin privileges
    async removeAdmin(userId) {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${userId}`, {
        method: "DELETE",
        headers: await createHeaders(),
      });
      return handleResponse(response);
    },
  };
}

// Export a simpler function-based API for non-React contexts
export const api = {
  baseURL: API_BASE_URL,
};
