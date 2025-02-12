import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repo/user.repository'; // Adjust the path
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    paginate: jest.fn().mockResolvedValue([]),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof UserRepository, jest.Mock>>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
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

      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const options = { page: 1, limit: 10 };
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

      (userRepository.createQueryBuilder as jest.Mock)().getMany.mockResolvedValue(mockUsers);
      const result = await userService.findAll(options);

      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
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

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findOne(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(userService.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      const mockUser = {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);
      (userService.findOne as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.update(userId, updateUserDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
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
      (userRepository.softDelete as jest.Mock).mockResolvedValue(undefined);

      await userService.remove(userId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userRepository.softDelete).toHaveBeenCalledWith(userId);
    });
  });
});
