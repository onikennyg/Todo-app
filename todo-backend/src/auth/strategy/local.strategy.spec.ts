import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service'; // Adjust path as needed
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = () => ({
  validateUser: jest.fn(),
});

type MockAuthService = Partial<Record<keyof AuthService, jest.Mock>>;

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: MockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user if the credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const mockUser = { id: 1, email: email, password: password };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await localStrategy.validate(email, password);

      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUser);
    });

    it('should throw an UnauthorizedException if the credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
