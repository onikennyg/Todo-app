import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

const mockUserService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

type MockUserService = Partial<Record<keyof UserService, jest.Mock>>;

describe('UserController', () => {
  let userController: UserController;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
      };
      const mockUser = { id: 1, ...createUserDto };

      (userService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10 };
      const mockUsers = [
        {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password',
          role: 'user',
        },
      ];

      (userService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userController.findAll(options.page, options.limit);

      expect(userService.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
      };

      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userController.findOne(userId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      const mockUser = {
        id: userId,
        firstName: 'Updated',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
      };

      (userService.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await userController.update(userId, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;

      (userService.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await userController.remove(userId);

      expect(userService.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });
});
