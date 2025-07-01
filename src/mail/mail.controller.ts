import { Controller } from '@nestjs/common'
import { MailService } from './mail.service'

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailService) {}
}
