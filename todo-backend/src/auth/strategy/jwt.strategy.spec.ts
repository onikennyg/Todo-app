import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret-key'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should validate and return user payload', async () => {
    const payload = { userId: 1, email: 'test@example.com', role: 'USER' };
    const result = await jwtStrategy.validate(payload);
    expect(result).toEqual(payload);
  });
});