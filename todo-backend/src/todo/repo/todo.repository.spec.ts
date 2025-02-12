import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoRepository } from './todo.repository';
import { Todo } from '../entities/todo.entity';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoRepository,
        {
          provide: getRepositoryToken(Todo),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TodoRepository>(TodoRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});