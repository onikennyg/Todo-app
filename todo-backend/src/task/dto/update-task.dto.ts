import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ description: 'The description of the task', example: 'Buy organic groceries', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether the task is completed', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'The due date of the task', example: '2024-01-05T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}