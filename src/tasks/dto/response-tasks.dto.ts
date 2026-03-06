import { Task } from '../entities/task.entity';

export class ResponseTasksDto {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
