import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            create: jest.fn(),
            findAllTodoByUserNotCompleted: jest.fn(),
            findAllTodoByUserCompleted: jest.fn(),
            findOne: jest.fn(),
            updateTodo: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const userId = 1;
      const createTodoDto: CreateTodoDto = {
        title: 'Shopping List',
      };

      const todo = {
        id: 1,
        title: 'Shopping List',
        user: { id: userId },
      };

      jest.spyOn(service, 'create').mockResolvedValue(todo as any);

      const result = await controller.create(createTodoDto, userId);

      expect(result).toEqual(todo);
      expect(service.create).toHaveBeenCalledWith(createTodoDto, userId);
    });
  });

  describe('findAllTodosByUserIdNotCompleted', () => {
    it('should return paginated todos for a user that are not completed', async () => {
      const userId = 1;
      const page = 1; // Changed from string to number
      const limit = 10; // Changed from string to number
      const options: IPaginationOptions = {
        page,
        limit,
      };
      const filter = { title: 'Shopping List' };
      const sort = { field: 'title', order: 'ASC' as const };
  
  
      const paginationResult = {
        items: [
          {
            id: 1,
            title: 'Shopping List',
            completed: false,
            user: { id: userId },
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
  
      jest.spyOn(service, 'findAllTodoByUserNotCompleted').mockResolvedValue(paginationResult as any);
  
      const result = await controller.findAllTodosByUserIdNotCompleted(
        userId,
        page,
        limit, 
        filter.title,
        sort.field,
        sort.order,
      );
  
      expect(result).toEqual(paginationResult);
      expect(service.findAllTodoByUserNotCompleted).toHaveBeenCalledWith(
        userId,
        options, 
        filter,
        sort,
      );
    });
  });
  
  describe('findAllTodosByUserIdCompleted', () => {
    it('should return paginated todos for a user that are completed', async () => {
      const userId = 1;
      const page = 1; 
      const limit = 10; 
      const options: IPaginationOptions = {
        page,
        limit,
      };
      const filter = { title: 'Shopping List' };
      const sort = { field: 'title', order: 'ASC' as const };
  
      const paginationResult = {
        items: [
          {
            id: 1,
            title: 'Shopping List',
            completed: true,
            user: { id: userId },
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
  
      jest.spyOn(service, 'findAllTodoByUserCompleted').mockResolvedValue(paginationResult as any);
  
      const result = await controller.findAllTodosByUserIdCompleted(
        userId,
        page, // Pass as string
        limit, // Pass as string
        filter.title,
        sort.field,
        sort.order,
      );
  
      expect(result).toEqual(paginationResult);
      expect(service.findAllTodoByUserCompleted).toHaveBeenCalledWith(
        userId,
        options, // Pass converted options
        filter,
        sort,
      );
    });
  });

  describe('findOne', () => {
    it('should return a todo by ID', async () => {
      const todoId = 1;
      const todo = {
        id: todoId,
        title: 'Shopping List',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(todo as any);

      const result = await controller.findOne(todoId);

      expect(result).toEqual(todo);
      expect(service.findOne).toHaveBeenCalledWith(todoId);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = 1;
      const updateTodoDto: UpdateTodoDto = {
        title: 'Grocery Shopping',
        completed: true,
      };

      const updatedTodo = {
        id: todoId,
        title: 'Grocery Shopping',
        completed: true,
      };

      jest.spyOn(service, 'updateTodo').mockResolvedValue(updatedTodo as any);

      const result = await controller.update(todoId, updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(service.updateTodo).toHaveBeenCalledWith(todoId, updateTodoDto);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const todoId = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(todoId);

      expect(service.remove).toHaveBeenCalledWith(todoId);
    });
  });
});