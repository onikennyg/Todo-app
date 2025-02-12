import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn(),
            findAllByTodo: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const todoId = 1;
      const createTaskDto: CreateTaskDto = {
        description: 'Buy groceries',
        dueDate: new Date(),
      };

      const task = {
        id: 1,
        description: 'Buy groceries',
        dueDate: new Date(),
        todo: { id: todoId },
      };

      jest.spyOn(service, 'create').mockResolvedValue(task as any);

      const result = await controller.create(todoId, createTaskDto);

      expect(result).toEqual(task);
      expect(service.create).toHaveBeenCalledWith(todoId, createTaskDto);
    });
  });

  describe('findAllByTodo', () => {
    it('should return paginated tasks for a todo', async () => {
      const todoId = 1;
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const filter = { description: 'Buy groceries', completed: false };
      const sortOrder: 'ASC' | 'DESC' = 'ASC'; // Fix: Explicitly type as 'ASC' | 'DESC'
      const sortBy = 'dueDate';
  
      const paginationResult = {
        items: [
          {
            id: 1,
            description: 'Buy groceries',
            completed: false,
            dueDate: new Date(),
            todo: { id: todoId },
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };
  
      jest.spyOn(service, 'findAllByTodo').mockResolvedValue(paginationResult as any);
  
      const result = await controller.findAllByTodo(
        todoId,
        options.page,
        options.limit,
        filter.description,
        filter.completed,
        sortBy,
        sortOrder, // Fix: Pass the correctly typed value
      );
  
      expect(result).toEqual(paginationResult);
      expect(service.findAllByTodo).toHaveBeenCalledWith(
        todoId,
        options,
        filter,
        { field: sortBy, order: sortOrder }, // Fix: Ensure correct typing here
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const taskId = 1;
      const task = {
        id: taskId,
        description: 'Buy groceries',
        completed: false,
        dueDate: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(task as any);

      const result = await controller.findOne(taskId);

      expect(result).toEqual(task);
      expect(service.findOne).toHaveBeenCalledWith(taskId);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        description: 'Buy organic groceries',
        completed: true,
      };

      const updatedTask = {
        id: taskId,
        description: 'Buy organic groceries',
        completed: true,
        dueDate: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedTask as any);

      const result = await controller.update(taskId, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith(taskId, updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(taskId);

      expect(service.remove).toHaveBeenCalledWith(taskId);
    });
  });
});