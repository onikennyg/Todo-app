import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../user/user.service'; // Adjust path as needed
import { User } from '../../user/entities/user.entity'; // Adjust path as needed
import { UnauthorizedException } from '@nestjs/common';

const mockUserService = () => ({
  findOne: jest.fn(),
});

type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user if the user is found', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const mockUser: User = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        todos: [],
      };

      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(payload);

      expect(userService.findOne).toHaveBeenCalledWith(payload.userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw an UnauthorizedException if the user is not found', async () => {
      const payload = { userId: 1, email: 'test@example.com' };

      (userService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
