import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: 'The title of the todo', example: 'Shopping List' })
  @IsString()
  @IsNotEmpty()
  title: string;
}