import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: jest.Mocked<TasksService>;

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

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const dto: CreateTaskDto = { title: 'Test Task' };
      service.create.mockResolvedValue(taskStub);

      const result = await controller.create(dto);

      expect(result).toEqual(taskStub);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return formatted ResponseTasksDto', async () => {
      const filters: FilterTasksDto = { page: 1, limit: 10 };
      service.findAll.mockResolvedValue([[taskStub], 1]);

      const result = await controller.findAll(filters);

      expect(result).toEqual({
        data: [taskStub],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should calculate totalPages correctly', async () => {
      const filters: FilterTasksDto = { page: 1, limit: 5 };

      service.findAll.mockResolvedValue([[taskStub], 23]);

      const result = await controller.findAll(filters);

      expect(result.totalPages).toBe(5);
      expect(result.total).toBe(23);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      service.findOne.mockResolvedValue(taskStub);

      const result = await controller.findOne(taskStub.id);

      expect(result).toEqual(taskStub);
      expect(service.findOne).toHaveBeenCalledWith(taskStub.id);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const dto: UpdateTaskDto = { title: 'Updated' };
      const updated = { ...taskStub, title: 'Updated' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(taskStub.id, dto);

      expect(result.title).toBe('Updated');
      expect(service.update).toHaveBeenCalledWith(taskStub.id, dto);
    });
  });

  describe('updateStatus', () => {
    it('should update the status and return the task', async () => {
      const dto: UpdateTaskStatusDto = { status: TaskStatus.DONE };
      const updated = { ...taskStub, status: TaskStatus.DONE };
      service.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus(taskStub.id, dto);

      expect(result.status).toBe(TaskStatus.DONE);
      expect(service.updateStatus).toHaveBeenCalledWith(taskStub.id, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(taskStub.id);

      expect(service.remove).toHaveBeenCalledWith(taskStub.id);
    });
  });
});
