import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repo/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: UserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword',
      };

      const user = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      user.role = 'NORMAL_USER_ROLE';

      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;

      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);

      const result = await service.findUserById(userId);

      expect(result).toEqual(user);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'findOneOrFail').mockRejectedValue(new NotFoundException());

      await expect(service.findUserById(userId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [new User(), new User()];

      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'john.doe@example.com';
      const user = new User();
      user.email = email;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findUserByEmail(email);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(userId);

      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});