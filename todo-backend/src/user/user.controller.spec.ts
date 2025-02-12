import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleGuard } from '../auth/guard/role.guard';
import { Constants } from '../utils/constants';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findUserById: jest.fn(),
            findUserByEmail: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword',
      };

      const user = {
        id: 1,
        ...createUserDto,
        role: Constants.ROLES.NORMAL_ROLE,
      };

      jest.spyOn(service, 'create').mockResolvedValue(user as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(user);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: Constants.ROLES.ADMIN_ROLE,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(users as any);

      const result = await controller.findAll({} as any);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;

      jest.spyOn(service, 'remove').mockResolvedValue({ affected: 1 } as any); // Fix: Return DeleteResult

      await controller.remove(userId.toString(), {} as any);

      expect(service.remove).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(userId.toString(), {} as any)).rejects.toThrowError(NotFoundException);
    });
  });
});