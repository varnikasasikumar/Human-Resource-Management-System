export interface Employee {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  salary: number;
  dateOfJoining?: string;
  status: string;
}

export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number | '';
  dateOfJoining: string;
  status: string;
}
