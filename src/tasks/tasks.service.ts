import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(dto);
    return this.tasksRepository.save(task);
  }

  async findAll(filters: FilterTasksDto): Promise<[Task[], number]> {
    return this.tasksRepository.findWithFilters(filters);
  }

  async findOne(id: string): Promise<Task> {
    return this.findTaskOrFail(id);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findTaskOrFail(id);
    Object.assign(task, dto);
    return this.tasksRepository.save(task);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task> {
    const task = await this.findTaskOrFail(id);
    task.status = dto.status;
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findTaskOrFail(id);
    await this.tasksRepository.remove(task);
  }

  private async findTaskOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }
}
