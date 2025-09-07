import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TaskStatus } from './task.model';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { Type } from 'class-transformer';


export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskLabelDto)
  labels?: CreateTaskLabelDto[];
}


export class UpdateTaskDto extends PartialType(CreateTaskDto) {}