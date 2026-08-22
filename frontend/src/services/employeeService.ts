import type { Employee, EmployeeFormData } from '../types/employee';

const API_BASE_URL = 'http://localhost:8081/api/employees';

export const employeeService = {
  async getAllEmployees(): Promise<Employee[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to fetch employees (${response.status})`);
    }
    return response.json();
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to fetch employee details (${response.status})`);
    }
    return response.json();
  },

  async createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      if (errorJson && errorJson.message) {
        throw new Error(errorJson.message);
      } else if (errorJson && errorJson.errors) {
        const firstError = Object.values(errorJson.errors)[0];
        throw new Error(String(firstError));
      }
      throw new Error(`Failed to create employee (${response.status})`);
    }
    return response.json();
  },

  async updateEmployee(id: string, employeeData: EmployeeFormData): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      if (errorJson && errorJson.message) {
        throw new Error(errorJson.message);
      } else if (errorJson && errorJson.errors) {
        const firstError = Object.values(errorJson.errors)[0];
        throw new Error(String(firstError));
      }
      throw new Error(`Failed to update employee (${response.status})`);
    }
    return response.json();
  },

  async deleteEmployee(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to delete employee (${response.status})`);
    }
  },
};
