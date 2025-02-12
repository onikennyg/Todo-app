import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({ description: 'The title of the todo', example: 'Grocery Shopping', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Whether the todo is completed', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'The due date of the todo', example: '2024-01-03T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}