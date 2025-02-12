import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Constants } from 'src/utils/constants';
import { ApiSecurity, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signUp')
  @ApiOperation({ summary: 'Create a new user', description: 'Registers a new user account.' })
  @ApiResponse({ status: 201, description: 'The newly created user.' })
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiSecurity('JWT-auth')
  @Get()
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @ApiOperation({ summary: 'Get all users (Admin only)', description: 'Retrieves a list of all users (Admin role required).' })
  @ApiResponse({ status: 200, description: 'The list of users.' })
  findAll(@Req() req) {
    console.log(req.user);
    return this.userService.findAll();
  }

  @ApiSecurity('JWT-auth')
  @Delete(':id')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @ApiOperation({ summary: 'Delete a user (Admin only)', description: 'Deletes a user account (Admin role required).' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  remove(@Param('id') id: string, @Req() req) {
    console.log(req.user);
    return this.userService.remove(+id);
  }
}
