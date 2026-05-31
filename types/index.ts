interface IGroupData {
  id: string;
  name: string;
  course: string;
  teacher: string;
  room: string;
  status: string;
  start_date: string;
  end_date: string;
  lesson_days: string;
  lesson_start_time: string;
  lesson_end_time: string;
  student_count: number;
  capacity: number;
  is_full: boolean;
}

interface IStudent {
  id: string;
  student_id: string;
  full_name: string;
  avatar: string;
  phone: string;
  email: string;
  center_name: string;
  status: string;
  enrolled_at: string;
}

interface IStudents<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string;
  previous: string;
  results: T;
}
interface ILearningCenters<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string;
  previous: string;
  results: T;
}

interface ILearningCenter {
  id: string;
  name: string;
  slug: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  director_name: string;
  students_count: number;
  subscription_expires: string;
}

interface IDirector {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}
