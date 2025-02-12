import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

describe('AuthController', () => {
  let authController: AuthController;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return a JWT token on successful login', () => {
    const req = { user: { id: 1, email: 'test@example.com', role: 'USER' } };
    const result = authController.login(req, { email: 'test@example.com', password: 'password' });

    expect(result).toEqual({ token: 'test-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: 1,
      email: 'test@example.com',
      role: 'USER',
    });
  });
});