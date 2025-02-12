import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repo/task.repository';
import { TodoService } from '../todo/todo.service';
import { Todo } from '../todo/entities/todo.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: TaskRepository;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useClass: TaskRepository,
        },
        {
          provide: TodoService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<TaskRepository>(getRepositoryToken(Task));
    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const todoId = 1;
      const createTaskDto = {
        description: 'Buy groceries',
        dueDate: new Date(),
      };

      const todo = new Todo();
      todo.id = todoId;

      const task = new Task();
      task.description = createTaskDto.description;
      task.dueDate = createTaskDto.dueDate;
      task.todo = todo;

      jest.spyOn(todoService, 'findOne').mockResolvedValue(todo); // Fix: Return a Todo object
      jest.spyOn(taskRepository, 'create').mockReturnValue(task);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(task);

      const result = await service.create(todoId, createTaskDto);

      expect(result).toEqual(task);
      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        todo,
      });
      expect(taskRepository.save).toHaveBeenCalledWith(task);
    });

    it('should throw NotFoundException if todo is not found', async () => {
      const todoId = 1;
      const createTaskDto = {
        description: 'Buy groceries',
        dueDate: new Date(),
      };

      // Simulate the "not found" case by throwing an error
      jest.spyOn(todoService, 'findOne').mockRejectedValue(new NotFoundException(`Todo with ID "${todoId}" not found`));

      await expect(service.create(todoId, createTaskDto)).rejects.toThrowError(
        `Todo with ID "${todoId}" not found`,
      );
    });
  });

  describe('findAllByTodo', () => {
    it('should return paginated tasks for a todo', async () => {
      const todoId = 1;
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const filter = { description: 'Buy groceries', completed: false };
      const sort = { field: 'dueDate', order: 'ASC' as const }; // Fix: Use 'as const'

      const todo = new Todo();
      todo.id = todoId;

      const task = new Task();
      task.description = 'Buy groceries';
      task.completed = false;
      task.dueDate = new Date();
      task.todo = todo;

      const paginationResult: Pagination<Task> = {
        items: [task],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      jest.spyOn(todoService, 'findOne').mockResolvedValue(todo);
      jest.spyOn(taskRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[task], 1]),
      } as any);

      const result = await service.findAllByTodo(todoId, options, filter, sort);

      expect(result).toEqual(paginationResult);
      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const taskId = 1;
      const task = new Task();
      task.id = taskId;
      task.description = 'Buy groceries';

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(task);

      const result = await service.findOne(taskId);

      expect(result).toEqual(task);
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
    });

    it('should throw NotFoundException if task is not found', async () => {
      const taskId = 1;

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrowError(
        `Task with ID "${taskId}" not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateTaskDto = {
        description: 'Buy organic groceries',
        completed: true,
      };

      const task = new Task();
      task.id = taskId;
      task.description = 'Buy groceries';
      task.completed = false;

      jest.spyOn(service, 'findOne').mockResolvedValue(task);
      jest.spyOn(taskRepository, 'update').mockResolvedValue({ affected: 1 } as any); // Fix: Return UpdateResult
      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...task,
        ...updateTaskDto,
      });

      const result = await service.update(taskId, updateTaskDto);

      expect(result).toEqual({
        ...task,
        ...updateTaskDto,
      });
      expect(service.findOne).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).toHaveBeenCalledWith(taskId, updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = 1;
      const task = new Task();
      task.id = taskId;

      jest.spyOn(service, 'findOne').mockResolvedValue(task);
      jest.spyOn(taskRepository, 'softDelete').mockResolvedValue({ affected: 1 } as any); // Fix: Return UpdateResult

      await service.remove(taskId);

      expect(service.findOne).toHaveBeenCalledWith(taskId);
      expect(taskRepository.softDelete).toHaveBeenCalledWith(taskId);
    });
  });
});