import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'The description of the task', example: 'Buy groceries' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The due date of the task', example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}