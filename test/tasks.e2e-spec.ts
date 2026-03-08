import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from '../src/tasks/tasks.module';
import { validationSchema } from '../src/config/validation.schema';
import { TaskStatus } from '../src/tasks/enums/task-status.enum';
import { TaskPriority } from '../src/tasks/enums/task-priority.enum';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          validationSchema,
          validationOptions: { abortEarly: true },
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get<string>('DB_HOST'),
            port: config.get<number>('DB_PORT'),
            username: config.get<string>('DB_USERNAME'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
        TasksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a task with only title', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'New Task' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('New Task');
          expect(res.body.status).toBe(TaskStatus.PENDING);
          expect(res.body.priority).toBe(TaskPriority.MEDIUM);
          expect(res.body.description).toBeNull();
        });
    });

    it('should create a task with all fields', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Full Task',
          description: 'A description',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('Full Task');
          expect(res.body.description).toBe('A description');
          expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
          expect(res.body.priority).toBe(TaskPriority.HIGH);
        });
    });

    it('should return 400 when title is missing', () => {
      return request(app.getHttpServer()).post('/tasks').send({}).expect(400);
    });

    it('should return 400 when title is empty string', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({ title: '' })
        .expect(400);
    });

    it('should return 400 for invalid status value', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task', status: 'INVALID' })
        .expect(400);
    });

    it('should return 400 for unknown properties (forbidNonWhitelisted)', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task', unknown: 'field' })
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.total).toBe(0);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
          expect(res.body.totalPages).toBe(0);
        });
    });

    it('should return tasks with pagination', async () => {
      for (const title of ['Task 1', 'Task 2', 'Task 3']) {
        await request(app.getHttpServer()).post('/tasks').send({ title });
      }

      return request(app.getHttpServer())
        .get('/tasks?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.total).toBe(3);
          expect(res.body.totalPages).toBe(2);
        });
    });

    it('should filter by status', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Pending', status: TaskStatus.PENDING });
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Done', status: TaskStatus.DONE });

      return request(app.getHttpServer())
        .get(`/tasks?status=${TaskStatus.DONE}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('Done');
        });
    });

    it('should search by title (ILIKE)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Buy groceries' });
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Clean house' });

      return request(app.getHttpServer())
        .get('/tasks?search=buy')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('Buy groceries');
        });
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Find me' });

      return request(app.getHttpServer())
        .get(`/tasks/${createRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Find me');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer()).get('/tasks/not-a-uuid').expect(400);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Original' });

      return request(app.getHttpServer())
        .patch(`/tasks/${createRes.body.id}`)
        .send({ title: 'Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .patch('/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .send({ title: 'Update' })
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('should update the status', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Status test' });

      return request(app.getHttpServer())
        .patch(`/tasks/${createRes.body.id}/status`)
        .send({ status: TaskStatus.DONE })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(TaskStatus.DONE);
        });
    });

    it('should return 400 for invalid status', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Status test' });

      return request(app.getHttpServer())
        .patch(`/tasks/${createRes.body.id}/status`)
        .send({ status: 'INVALID' })
        .expect(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should soft-delete a task and return 204', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Delete me' });

      await request(app.getHttpServer())
        .delete(`/tasks/${createRes.body.id}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/tasks/${createRes.body.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(404);
    });
  });
});
