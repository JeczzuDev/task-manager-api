import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TasksRepository>;

  const taskStub: Task = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date('2026-03-06T00:00:00.000Z'),
    updatedAt: new Date('2026-03-06T00:00:00.000Z'),
    deletedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findWithFilters: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(TasksRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new task', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      repository.create.mockReturnValue(taskStub);
      repository.save.mockResolvedValue(taskStub);

      const result = await service.create(dto);

      expect(result).toEqual(taskStub);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(taskStub);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks and count', async () => {
      const filters: FilterTasksDto = { page: 1, limit: 10 };
      const expected: [Task[], number] = [[taskStub], 1];

      repository.findWithFilters.mockResolvedValue(expected);

      const result = await service.findAll(filters);

      expect(result).toEqual(expected);
      expect(repository.findWithFilters).toHaveBeenCalledWith(filters);
    });

    it('should pass filters to repository', async () => {
      const filters: FilterTasksDto = {
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        search: 'urgent',
        page: 2,
        limit: 5,
      };

      repository.findWithFilters.mockResolvedValue([[], 0]);

      await service.findAll(filters);

      expect(repository.findWithFilters).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a task when it exists', async () => {
      repository.findById.mockResolvedValue(taskStub);

      const result = await service.findOne(taskStub.id);

      expect(result).toEqual(taskStub);
      expect(repository.findById).toHaveBeenCalledWith(taskStub.id);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Task with ID "nonexistent-id" not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const dto: UpdateTaskDto = { title: 'Updated Title' };
      const updatedTask: Task = { ...taskStub, title: 'Updated Title' };

      repository.findById.mockResolvedValue(taskStub);
      repository.save.mockResolvedValue(updatedTask);

      const result = await service.update(taskStub.id, dto);

      expect(result.title).toBe('Updated Title');
      expect(repository.findById).toHaveBeenCalledWith(taskStub.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update the status and return the task', async () => {
      const dto: UpdateTaskStatusDto = { status: TaskStatus.DONE };
      const updatedTask: Task = { ...taskStub, status: TaskStatus.DONE };

      repository.findById.mockResolvedValue(taskStub);
      repository.save.mockResolvedValue(updatedTask);

      const result = await service.updateStatus(taskStub.id, dto);

      expect(result.status).toBe(TaskStatus.DONE);
      expect(repository.findById).toHaveBeenCalledWith(taskStub.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when task does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent-id', {
          status: TaskStatus.IN_PROGRESS,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the task (soft delete)', async () => {
      repository.findById.mockResolvedValue(taskStub);
      repository.remove.mockResolvedValue(taskStub);

      await service.remove(taskStub.id);

      expect(repository.findById).toHaveBeenCalledWith(taskStub.id);
      expect(repository.remove).toHaveBeenCalledWith(taskStub);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
