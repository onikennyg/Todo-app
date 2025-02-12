import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './repo/task.repository';
import { TodoService } from 'src/todo/todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const mockTaskRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]), // Default to empty array
    paginate: jest.fn().mockResolvedValue([]),
  }),
});

const mockTodoService = () => ({
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof TaskRepository, jest.Mock>>;
type MockTodoService<T = any> = Partial<Record<keyof TodoService, jest.Mock>>;

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: MockRepository;
  let todoService: MockTodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
        {
          provide: TodoService,
          useFactory: mockTodoService,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get(getRepositoryToken(Task));
    todoService = module.get(TodoService);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const todoId = 1;
      const createTaskDto: CreateTaskDto = { description: 'Test Task' };
      const mockTodo = { id: todoId, title: 'Test Todo' }; // Mock Todo object
      const mockTask = { id: 1, description: 'Test Task', todo: mockTodo };

      (todoService.findOne as jest.Mock).mockResolvedValue(mockTodo);
      (taskRepository.create as jest.Mock).mockReturnValue(mockTask);
      (taskRepository.save as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.create(todoId, createTaskDto);

      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(taskRepository.create).toHaveBeenCalledWith({ ...createTaskDto, todo: mockTodo });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if todo is not found', async () => {
      const todoId = 1;
      const createTaskDto: CreateTaskDto = { description: 'Test Task' };

      (todoService.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(taskService.create(todoId, createTaskDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByTodo', () => {
    it('should return a paginated list of tasks for a given todo', async () => {
      const todoId = 1;
      const options = { page: 1, limit: 10 };
      const mockTodo = { id: todoId, title: 'Test Todo' };
      const mockTasks = [{ id: 1, description: 'Test Task', todo: mockTodo }];

      (todoService.findOne as jest.Mock).mockResolvedValue(mockTodo);
      (taskRepository.createQueryBuilder as jest.Mock)().getMany.mockResolvedValue(mockTasks);
      const result = await taskService.findAllByTodo(todoId, options);
      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTasks);
    });

    it('should throw NotFoundException if todo is not found', async () => {
      const todoId = 1;
      const options = { page: 1, limit: 10 };

      (todoService.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(taskService.findAllByTodo(todoId, options)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 1;
      const mockTask = { id: taskId, description: 'Test Task' };

      (taskRepository.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.findOne(taskId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task is not found', async () => {
      const taskId = 1;

      (taskRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(taskService.findOne(taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = { description: 'Updated Task' };
      const mockTask = { id: taskId, description: 'Test Task' };
      const updatedTask = { id: taskId, description: 'Updated Task' };

      (taskService.findOne as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);
      (taskService.findOne as jest.Mock).mockResolvedValue(updatedTask);

      const result = await taskService.update(taskId, updateTaskDto);

      expect(taskService.findOne).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(taskService.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = 1;
      const mockTask = { id: taskId, description: 'Test Task' };

      (taskService.findOne as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.softDelete as jest.Mock).mockResolvedValue(undefined);

      await taskService.remove(taskId);

      expect(taskService.findOne).toHaveBeenCalledWith(taskId);
      expect(taskRepository.softDelete).toHaveBeenCalledWith(taskId);
    });
  });
});
