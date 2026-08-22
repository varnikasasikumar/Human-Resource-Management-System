import type { Attendance } from '../types/attendance';

const API_BASE_URL = 'http://localhost:8082/api/attendance';

export const attendanceService = {
  async checkIn(employeeId: string): Promise<Attendance> {
    const response = await fetch(`${API_BASE_URL}/check-in/${encodeURIComponent(employeeId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorMessage = errorJson?.message || `Check-in failed (${response.status})`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async checkOut(employeeId: string): Promise<Attendance> {
    const response = await fetch(`${API_BASE_URL}/check-out/${encodeURIComponent(employeeId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorMessage = errorJson?.message || `Check-out failed (${response.status})`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async getEmployeeAttendanceHistory(employeeId: string): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/employee/${encodeURIComponent(employeeId)}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Failed to fetch attendance history (${response.status})`);
    }
    return response.json();
  },

  async getEmployeeAttendanceByDate(employeeId: string, date: string): Promise<Attendance | null> {
    const response = await fetch(`${API_BASE_URL}/employee/${encodeURIComponent(employeeId)}/date/${date}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch attendance for date (${response.status})`);
    }
    return response.json();
  },

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const response = await fetch(`${API_BASE_URL}/date/${date}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch attendance records for date (${response.status})`);
    }
    return response.json();
  },
};
