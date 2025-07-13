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
import { CategoryModule } from './category/category.module'
import { SubCategoryModule } from './sub_category/sub_category.module'
import { ProductsModule } from './products/products.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module'
import { OtpModule } from './otp/otp.module'
import { StoresModule } from './stores/stores.module'
import { PickStationModule } from './pick_station/pick_station.module'
import { DriverModule } from './driver/driver.module'
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({ global: true }),
    MailModule,
    UserModule,
    AuthModule,
    CountyModule,
    ConstituencyModule,
    CategoryModule,
    SubCategoryModule,
    ProductsModule,
    CloudinaryModule,
    OtpModule,
    StoresModule,
    PickStationModule,
    DriverModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
