import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto.js';
import { CurrentUser } from '@common/decorators/current-user.decorator.js';
import { Public } from '@common/decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(200)
    refresh(@Body() dto: RefreshDto) {
        return this.auth.refresh(dto.refreshToken);
    }

    @Get('me')
    me(@CurrentUser('id') userId: string) {
        return this.auth.me(userId);
    }

    @Post('logout-all')
    @HttpCode(204)
    logoutAll(@CurrentUser('id') userId: string) {
        this.auth.logoutAll(userId);
    }
}