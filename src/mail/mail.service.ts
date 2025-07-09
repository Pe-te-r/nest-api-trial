import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { join } from 'path'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserRegistration(firstName: string, email: string) {
    const joinedAt = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    console.log('sending...')
    console.log('Resolved template dir:', join(__dirname, 'templates'))

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our Platform!',
      template: 'register',
      context: {
        firstName,
        joinedAt,
      },
    })
  }

  async sendForgotPassword(email: string, temporaryPassword: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Temporary Password',
      template: 'forgot-password', // this should match your .hbs file
      context: {
        temporaryPassword,
        firstName,
      },
    })
  }

  async updatePassword(email: string, first_name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your password has been updated',
      template: 'password-update-success',
      context: {
        firstName: first_name,
      },
    })
  }
  // * used to send codes
  async sendCode(email: string, first_name: string, code: string, reason: string) {
    console.log('sending')
    await this.mailerService.sendMail({
      to: email,
      subject: `Your groceryStore Verification Code: ${code}`,
      template: 'code',
      context: {
        firstName: first_name,
        code: code,
        reason,
        currentYear: new Date().getFullYear(),
      },
    })
  }
}
