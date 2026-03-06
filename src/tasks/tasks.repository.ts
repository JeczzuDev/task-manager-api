import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  create(dto: CreateTaskDto): Task {
    return this.repo.create(dto);
  }

  async save(task: Task): Promise<Task> {
    return this.repo.save(task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findWithFilters(filters: FilterTasksDto): Promise<[Task[], number]> {
    const { status, priority, search, page = 1, limit = 10 } = filters;

    const query = this.repo.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (priority) {
      query.andWhere('task.priority = :priority', { priority });
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('task.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    return query.getManyAndCount();
  }

  async remove(task: Task): Promise<Task> {
    return this.repo.softRemove(task);
  }
}
