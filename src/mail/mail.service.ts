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
        year: new Date().getFullYear(),
      },
    })
  }

  // vendor application
  async sendVendorApplicationEmail(
  email: string,
  ownerName: string,
  businessName: string,
  constituencyName: string,
  businessContact: string
) {
  await this.mailerService.sendMail({
    to: email,
    subject: 'Your Vendor Application Has Been Received',
    template: 'vendor-application',
    context: {
      ownerName,
      businessName,
      constituencyName,
      businessContact,
      currentYear: new Date().getFullYear()
    },
  });
}

  async sendForgotPassword(email: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Temporary Password',
      template: 'forgot-password', // this should match your .hbs file
      context: {
        firstName,
      },
    })
  }

  async sendVendorApprovalEmail(
  email: string, 
  first_name: string,
  business_name: string,
  business_location?: string,
  constituency?: string
) {
  await this.mailerService.sendMail({
    to: email,
    subject: 'Congratulations! Your Vendor Application Has Been Approved',
    template: 'vendor_approval', // This should match your template file name
    context: {
      first_name: first_name,
      business_name: business_name,
      business_location: business_location || '', // Fallback to empty if not provided
      constituency: constituency || '', // Fallback to empty if not provided
      vendor_dashboard_url: 'https://yourgrocerystore.com/vendor/dashboard',
      platform_name: 'Grocery Store',
      current_year: new Date().getFullYear(),
      privacy_policy_url: 'https://yourgrocerystore.com/privacy',
      terms_of_service_url: 'https://yourgrocerystore.com/terms',
    },
  });
}

  async updatePassword(email: string, first_name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your password has been updated',
      template: 'password-update-success',
      context: {
        firstName: first_name,
        siteName: 'Grocery Store',
        domain: 'yourgrocerystore.com',
        year: new Date().getFullYear(),
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
