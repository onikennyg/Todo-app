import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { TodoRepository } from './repo/todo.repository';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { NotFoundException } from '@nestjs/common';

describe('TodoService', () => {
  let service: TodoService;
  let todoRepository: TodoRepository;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepository,
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    todoRepository = module.get<TodoRepository>(getRepositoryToken(Todo));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const userId = 1;
      const createTodoDto = {
        title: 'Shopping List',
      };

      const user = new User();
      user.id = userId;

      const todo = new Todo();
      todo.title = createTodoDto.title;
      todo.date = new Date().toLocaleString();
      todo.completed = false;
      todo.user = user;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(todoRepository, 'save').mockResolvedValue(todo);

      const result = await service.create(createTodoDto, userId);

      expect(result).toEqual(todo);
      expect(userService.findUserById).toHaveBeenCalledWith(userId);
      expect(todoRepository.save).toHaveBeenCalledWith(todo);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;
      const createTodoDto = {
        title: 'Shopping List',
      };

      jest.spyOn(userService, 'findUserById').mockRejectedValue(new NotFoundException(`User with ID "${userId}" not found`));

      await expect(service.create(createTodoDto, userId)).rejects.toThrowError(
        `User with ID "${userId}" not found`,
      );
    });
  });

  describe('findAllTodoByUserNotCompleted', () => {
    it('should return paginated todos for a user that are not completed', async () => {
      const userId = 1;
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const filter = { title: 'Shopping List' };
      const sort = { field: 'title', order: 'ASC' as const };

      const user = new User();
      user.id = userId;

      const todo = new Todo();
      todo.title = 'Shopping List';
      todo.completed = false;
      todo.user = user;

      const paginationResult: Pagination<Todo> = {
        items: [todo],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(todoRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[todo], 1]),
      } as any);

      const result = await service.findAllTodoByUserNotCompleted(
        userId,
        options,
        filter,
        sort,
      );

      expect(result).toEqual(paginationResult);
      expect(userService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findAllTodoByUserCompleted', () => {
    it('should return paginated todos for a user that are completed', async () => {
      const userId = 1;
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const filter = { title: 'Shopping List' };
      const sort = { field: 'title', order: 'ASC' as const };

      const user = new User();
      user.id = userId;

      const todo = new Todo();
      todo.title = 'Shopping List';
      todo.completed = true;
      todo.user = user;

      const paginationResult: Pagination<Todo> = {
        items: [todo],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(user);
      jest.spyOn(todoRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[todo], 1]),
      } as any);

      const result = await service.findAllTodoByUserCompleted(
        userId,
        options,
        filter,
        sort,
      );

      expect(result).toEqual(paginationResult);
      expect(userService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a todo by ID', async () => {
      const todoId = 1;
      const todo = new Todo();
      todo.id = todoId;
      todo.title = 'Shopping List';

      jest.spyOn(todoRepository, 'findOne').mockResolvedValue(todo);

      const result = await service.findOne(todoId);

      expect(result).toEqual(todo);
      expect(todoRepository.findOne).toHaveBeenCalledWith({
        where: { id: todoId },
        relations: ['tasks', 'user'],
      });
    });

    it('should throw NotFoundException if todo is not found', async () => {
      const todoId = 1;

      jest.spyOn(todoRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(todoId)).rejects.toThrowError(
        `Todo with ID "${todoId}" not found`,
      );
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', async () => {
      const todoId = 1;
      const updateTodoDto = {
        title: 'Grocery Shopping',
        completed: true,
      };

      const todo = new Todo();
      todo.id = todoId;
      todo.title = 'Shopping List';
      todo.completed = false;

      jest.spyOn(service, 'findOne').mockResolvedValue(todo);
      jest.spyOn(todoRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...todo,
        ...updateTodoDto,
      });

      const result = await service.updateTodo(todoId, updateTodoDto);

      expect(result).toEqual({
        ...todo,
        ...updateTodoDto,
      });
      expect(service.findOne).toHaveBeenCalledWith(todoId);
      expect(todoRepository.update).toHaveBeenCalledWith(todoId, updateTodoDto);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const todoId = 1;
      const todo = new Todo();
      todo.id = todoId;

      jest.spyOn(service, 'findOne').mockResolvedValue(todo);
      jest.spyOn(todoRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(todoId);

      expect(service.findOne).toHaveBeenCalledWith(todoId);
      expect(todoRepository.delete).toHaveBeenCalledWith(todoId);
    });
  });
});