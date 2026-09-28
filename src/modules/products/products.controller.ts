import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator.js';
import { CurrentUser } from '@common/decorators/current-user.decorator.js';
import { FeatureFlag } from '@common/decorators/feature-flag.decorator.js';
import { Public } from '@common/decorators/public.decorator.js';
import { type AuthUser } from '@common/types/auth-user.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto, ProductQueryDto } from './dto/product.dto.js';

@Controller('products')
export class ProductsController {
    constructor(private readonly products: ProductsService) {}

    @Public()
    @Get()
    findAll(@Query() query: ProductQueryDto) {
        return this.products.findAll(query);
    }

    // ⚠️ ANTES de ':id', o Nest interpreta "recommendations" como un id
    @FeatureFlag('product-recommendations')
    @Get('recommendations')
    recommendations() {
        return this.products.recommendations();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.products.findOne(id);
    }

    @Roles('admin', 'merchant')
    @Post()
    create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
        return this.products.create(dto, user);
    }

    @Roles('admin', 'merchant')
    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
        this.products.remove(id, user);
    }
}