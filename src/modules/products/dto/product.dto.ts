import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { PaginationDto } from '@common/dto/pagination.dto.js';

export enum ProductCategory { FOOD = 'food', DRINK = 'drink', DESSERT = 'dessert' }

export class CreateProductDto {
    @IsString() @MaxLength(120) name!: string;
    @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() @Max(10_000_000) price!: number;
    @IsEnum(ProductCategory) category!: ProductCategory;
    @IsOptional() @IsInt() @Min(0) stock?: number;
    @IsOptional() @IsString() merchantId?: string;   // solo lo usa el admin
}

export class ProductQueryDto extends PaginationDto {
    @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
}

@Exclude()
export class ProductResponseDto {
    @Expose() id!: string;
    @Expose() merchantId!: string;
    @Expose() name!: string;
    @Expose() price!: number;
    @Expose() promoPrice!: number | null;
    @Expose() category!: string;
    @Expose() stock!: number;
    internalCostCents!: number;   // sin @Expose: no sale nunca
}