import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { TodoRepository } from './repo/todo.repository'; // Adjust the path
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const mockTodoRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    paginate: jest.fn().mockResolvedValue([]),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof TodoRepository, jest.Mock>>;

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useFactory: mockTodoRepository,
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'Test Todo' };
      const mockTodo = { id: 1, title: 'Test Todo' };

      (todoRepository.create as jest.Mock).mockReturnValue(mockTodo);
      (todoRepository.save as jest.Mock).mockResolvedValue(mockTodo);

      const result = await todoService.create(createTodoDto);

      expect(todoRepository.create).toHaveBeenCalledWith(createTodoDto);
      expect(todoRepository.save).toHaveBeenCalledWith(mockTodo);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of todos', async () => {
      const options = { page: 1, limit: 10 };
      const mockTodos = [{ id: 1, title: 'Test Todo' }];

      (todoRepository.createQueryBuilder as jest.Mock)().getMany.mockResolvedValue(mockTodos);
      const result = await todoService.findAll(options);

      expect(todoRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockTodos);
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      const todoId = 1;
      const mockTodo = { id: todoId, title: 'Test Todo' };

      (todoRepository.findOne as jest.Mock).mockResolvedValue(mockTodo);

      const result = await todoService.findOne(todoId);

      expect(todoRepository.findOne).toHaveBeenCalledWith({ where: { id: todoId } });
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException if todo is not found', async () => {
      const todoId = 1;

      (todoRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(todoService.findOne(todoId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = 1;
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo' };
      const mockTodo = { id: todoId, title: 'Test Todo' };
      const updatedTodo = { id: todoId, title: 'Updated Todo' };

      (todoService.findOne as jest.Mock).mockResolvedValue(mockTodo);
      (todoRepository.update as jest.Mock).mockResolvedValue(updatedTodo);
      (todoService.findOne as jest.Mock).mockResolvedValue(updatedTodo);

      const result = await todoService.update(todoId, updateTodoDto);

      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(todoRepository.update).toHaveBeenCalledWith(todoId, updateTodoDto);
      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const todoId = 1;
      const mockTodo = { id: todoId, title: 'Test Todo' };

      (todoService.findOne as jest.Mock).mockResolvedValue(mockTodo);
      (todoRepository.softDelete as jest.Mock).mockResolvedValue(undefined);

      await todoService.remove(todoId);

      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(todoRepository.softDelete).toHaveBeenCalledWith(todoId);
    });
  });
});
