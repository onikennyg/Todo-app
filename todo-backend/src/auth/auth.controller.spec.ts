import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthService } from '../auth.service';

const mockJwtService = () => ({
    sign: jest.fn(),
});

const mockAuthService = () => ({
    login: jest.fn(),
});

type MockJwtService = Partial<Record<keyof JwtService, jest.Mock>>;
type MockAuthService = Partial<Record<keyof AuthService, jest.Mock>>;

// Mock AuthGuard to bypass authentication during testing
class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        return true; // Simulate successful authentication
    }
}

describe('AuthController', () => {
    let authController: AuthController;
    let jwtService: MockJwtService;
    let authService: MockAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: JwtService,
                    useFactory: mockJwtService,
                },
                {
                    provide: AuthService,
                    useFactory: mockAuthService,
                },
            ],
        })
            .overrideGuard(AuthGuard('local')) // Override AuthGuard with MockAuthGuard
            .useClass(MockAuthGuard)
            .compile();

        authController = module.get<AuthController>(AuthController);
        jwtService = module.get(JwtService);
        authService = module.get(AuthService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should return a JWT token on successful login', async () => {
            // Mock user object (simulating what the AuthGuard would provide)
            const mockUser: User = {
                id: 1,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password', // In real scenarios, you would hash the password
                role: 'user',
                todos: [],
            };
            const mockToken = 'mockedJwtToken';

            (authService.login as jest.Mock).mockResolvedValue({ access_token: mockToken });

            // Call the login method, passing in the mock user
            const result = await authController.login(mockUser);

            // Assert that the AuthService.login method was called with the correct payload
            expect(authService.login).toHaveBeenCalledWith(mockUser);

            // Assert that the login method returns the mock token
            expect(result).toEqual({ access_token: mockToken });
        });
    });
});
