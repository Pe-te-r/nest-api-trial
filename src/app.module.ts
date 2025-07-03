import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { AtGuard } from './auth/guard/ac.guard'
import { MailModule } from './mail/mail.module'
import { CountyModule } from './county/county.module'
import { ConstituencyModule } from './constituency/constituency.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({ global: true }),
    UserModule,
    AuthModule,
    MailModule,
    CountyModule,
    ConstituencyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
