import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { MaintenanceMiddleware } from '@modules/feature-flags/maintenance.middleware.js';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // por controller: evitamos los wildcards de ruta (cambiaron en Express 5 / Nest 11)
        consumer.apply(MaintenanceMiddleware).forRoutes(ProductsController);
    }
}