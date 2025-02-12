import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

const mockTodoService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

type MockTodoService = Partial<Record<keyof TodoService, jest.Mock>>;

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: MockTodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useFactory: mockTodoService,
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
    todoService = module.get(TodoService);
  });

  it('should be defined', () => {
    expect(todoController).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto: CreateTodoDto = { title: 'Test Todo' };
      const mockTodo = { id: 1, title: 'Test Todo' };

      (todoService.create as jest.Mock).mockResolvedValue(mockTodo);

      const result = await todoController.create(createTodoDto);

      expect(todoService.create).toHaveBeenCalledWith(createTodoDto);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of todos', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const mockTodos = [{ id: 1, title: 'Test Todo' }];

      (todoService.findAll as jest.Mock).mockResolvedValue(mockTodos);

      const result = await todoController.findAll(options.page, options.limit);

      expect(todoService.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockTodos);
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      const todoId = 1;
      const mockTodo = { id: todoId, title: 'Test Todo' };

      (todoService.findOne as jest.Mock).mockResolvedValue(mockTodo);

      const result = await todoController.findOne(todoId);

      expect(todoService.findOne).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = 1;
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo' };
      const mockTodo = { id: todoId, title: 'Updated Todo' };

      (todoService.update as jest.Mock).mockResolvedValue(mockTodo);

      const result = await todoController.update(todoId, updateTodoDto);

      expect(todoService.update).toHaveBeenCalledWith(todoId, updateTodoDto);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const todoId = 1;

      (todoService.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await todoController.remove(todoId);

      expect(todoService.remove).toHaveBeenCalledWith(todoId);
      expect(result).toBeUndefined();
    });
  });
});
