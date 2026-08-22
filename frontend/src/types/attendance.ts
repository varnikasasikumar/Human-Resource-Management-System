export interface Attendance {
  id?: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
}
