import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateFlagDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(100) rolloutPercent?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) enabledFor?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) disabledFor?: string[];
}