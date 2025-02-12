import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

const mockTaskService = () => ({
  create: jest.fn(),
  findAllByTodo: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

type MockTaskService = Partial<Record<keyof TaskService, jest.Mock>>;

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: MockTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useFactory: mockTaskService,
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get(TaskService);
  });

  it('should be defined', () => {
    expect(taskController).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const todoId = 1;
      const createTaskDto: CreateTaskDto = { description: 'Test Task' };
      const mockTask = { id: 1, description: 'Test Task' };

      (taskService.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskController.create(todoId, createTaskDto);

      expect(taskService.create).toHaveBeenCalledWith(todoId, createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAllByTodo', () => {
    it('should return a paginated list of tasks for a given todo', async () => {
      const todoId = 1;
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const filter = { description: 'Test', completed: false };
      const sort = { field: 'description', order: 'ASC' };
      const mockTasks = [{ id: 1, description: 'Test Task' }];

      (taskService.findAllByTodo as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskController.findAllByTodo(todoId, options.page, options.limit, filter.description, filter.completed, sort.field, 'ASC');

      expect(taskService.findAllByTodo).toHaveBeenCalledWith(todoId, options, filter, sort);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 1;
      const mockTask = { id: taskId, description: 'Test Task' };

      (taskService.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskController.findOne(taskId);

      expect(taskService.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = { description: 'Updated Task' };
      const mockTask = { id: taskId, description: 'Updated Task' };

      (taskService.update as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskController.update(taskId, updateTaskDto);

      expect(taskService.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = 1;

      (taskService.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await taskController.remove(taskId);

      expect(taskService.remove).toHaveBeenCalledWith(taskId);
      expect(result).toBeUndefined();
    });
  });
});
