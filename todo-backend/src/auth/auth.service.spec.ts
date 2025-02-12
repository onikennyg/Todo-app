import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/user.service';

const mockUserService = () => ({
  validateUser: jest.fn(),
});

type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

describe('AuthService', () => {
  let authService: AuthService;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const mockUser = { id: 1, email: email, password: password }; // Simplified

      (userService.validateUser as jest.Mock).mockResolvedValue(mockUser); // Adjust

      const result = await authService.validateUser(email, password);

      expect(userService.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUser);
    });

    it('should return null if credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      (userService.validateUser as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser(email, password);

      expect(userService.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toBeNull();
    });
  });
});