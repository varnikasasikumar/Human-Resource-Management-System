import type { Leave, LeaveRequestFormData } from '../types/leave';

const API_BASE_URL = 'http://localhost:8083/api/leaves';

export const leaveService = {
  async applyForLeave(requestData: LeaveRequestFormData): Promise<Leave> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      if (errorJson && errorJson.message) {
        throw new Error(errorJson.message);
      } else if (errorJson && errorJson.errors) {
        const firstError = Object.values(errorJson.errors)[0];
        throw new Error(String(firstError));
      }
      throw new Error(`Failed to apply for leave (${response.status})`);
    }
    return response.json();
  },

  async getEmployeeLeaves(employeeId: string): Promise<Leave[]> {
    const response = await fetch(`${API_BASE_URL}/employee/${encodeURIComponent(employeeId)}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Failed to fetch employee leaves (${response.status})`);
    }
    return response.json();
  },

  async getLeaveById(id: string): Promise<Leave> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Leave request not found (${response.status})`);
    }
    return response.json();
  },

  async getPendingLeaves(): Promise<Leave[]> {
    const response = await fetch(`${API_BASE_URL}/pending`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Failed to fetch pending leave requests (${response.status})`);
    }
    return response.json();
  },

  async approveLeave(id: string): Promise<Leave> {
    const response = await fetch(`${API_BASE_URL}/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || `Failed to approve leave request (${response.status})`);
    }
    return response.json();
  },

  async rejectLeave(id: string): Promise<Leave> {
    const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || `Failed to reject leave request (${response.status})`);
    }
    return response.json();
  },
};
