import { LocalStrategy } from './local.strategy';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from 'src/user/entities/user.entity';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    userService = module.get<UserService>(UserService);
  });

  it('should validate and return user if credentials are correct', async () => {
    const user: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password',
      role: 'USER',
      todos: [], // Add todos as it's part of the User entity
    };

    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);

    const result = await localStrategy.validate(user.email, user.password);
    expect(result).toEqual(user);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

    await expect(localStrategy.validate('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const user: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password',
      role: 'USER',
      todos: [], // Add todos as it's part of the User entity
    };

    jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);

    await expect(localStrategy.validate(user.email, 'wrong-password')).rejects.toThrow(UnauthorizedException);
  });
});