import { Injectable, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { NotFoundError } from '@common/errors/domain.exception.js';
import { ErrorCodes } from '@common/errors/error-codes.js';
import { AuthUser } from '@common/types/auth-user.js';
import { FeatureFlagsService } from '@modules/feature-flags/feature-flags.service.js';
import { SEED_MERCHANT_ID } from '@modules/users/users.repository.js';
import { CreateProductDto, ProductCategory, ProductQueryDto, ProductResponseDto } from './dto/product.dto.js';

interface Product {
  id: string;
  merchantId: string;
  name: string;
  priceCents: number;
  internalCostCents: number;
  category: ProductCategory;
  stock: number;
}

class ProductNotFoundError extends NotFoundError {
    readonly code = ErrorCodes.PRODUCT_NOT_FOUND;
    constructor(id: string) {
        super(`El producto ${id} no existe`, { productId: id });
    }
}

@Injectable()
export class ProductsService implements OnModuleInit {
    private readonly products = new Map<string, Product>();

    constructor(private readonly flags: FeatureFlagsService) {}

    onModuleInit() {
        const seed: Array<[string, number, ProductCategory, number]> = [
            ['Muzzarella', 850000, ProductCategory.FOOD, 50],
            ['Fugazzeta', 920000, ProductCategory.FOOD, 30],
            ['Empanada de carne', 120000, ProductCategory.FOOD, 200],
            ['Coca-Cola 1.5L', 350000, ProductCategory.DRINK, 100],
            ['Flan con dulce', 280000, ProductCategory.DESSERT, 20],
        ];
        for (const [name, priceCents, category, stock] of seed) {
            const id = randomUUID();
            this.products.set(id, {
                id, name, priceCents, category, stock,
                merchantId: SEED_MERCHANT_ID,
                internalCostCents: Math.round(priceCents * 0.4),
            });
        }
    }

    findAll(q: ProductQueryDto) {
        const all = [...this.products.values()].filter((p) => !q.category || p.category === q.category);
        return {
            items: all.slice(q.skip, q.skip + q.limit).map((p) => this.toResponse(p)),
            total: all.length,
            page: q.page,
            limit: q.limit,
        };
    }

    findOne(id: string) {
        const p = this.products.get(id);
        if (!p) throw new ProductNotFoundError(id);
        return this.toResponse(p);
    }

    recommendations() {
        return [...this.products.values()]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 3)
        .map((p) => this.toResponse(p));
    }

    create(dto: CreateProductDto, user: AuthUser) {
        const merchantId = user.role === 'merchant' ? user.merchantId! : dto.merchantId ?? SEED_MERCHANT_ID;
        const priceCents = Math.round(dto.price * 100);
        const product: Product = {
            id: randomUUID(),
            merchantId,
            name: dto.name,
            priceCents,
            internalCostCents: Math.round(priceCents * 0.4),
            category: dto.category,
            stock: dto.stock ?? 0,
        };
        this.products.set(product.id, product);
        return this.toResponse(product);
    }

    remove(id: string, user: AuthUser) {
        const p = this.products.get(id);
        // ownership en el service, y 404 si no es tuyo: no confirmamos que existe
        if (!p || (user.role === 'merchant' && p.merchantId !== user.merchantId)) {
            throw new ProductNotFoundError(id);
        }
        this.products.delete(id);
    }

    private toResponse(p: Product): ProductResponseDto {
        // flag DENTRO de la lógica: el uso más común
        const promo = this.flags.isEnabled('promo-pricing', { merchantId: p.merchantId });
        return plainToInstance(
            ProductResponseDto,
            {
                ...p,
                price: p.priceCents / 100,
                promoPrice: promo ? Math.round(p.priceCents * 0.9) / 100 : null,
            },
            { excludeExtraneousValues: true },
        );
    }
}