import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      smtpTransport(
        process.env.NODE_ENV === 'prod'
          ? {
              host: process.env.NODEMAILER_HOST,
              port: process.env.NODEMAILER_PORT,
              auth: {
                user: process.env.NODEMAILER_USER_EMAIL,
                pass: process.env.NODEMAILER_USER_PASSWORD,
              },
            }
          : {
              service: 'gmail', // or your SMTP service
              auth: {
                user: process.env.NODEMAILER_USER_EMAIL,
                pass: process.env.NODEMAILER_USER_PASSWORD,
              },
            },
      ),
    );
    SendGrid.setApiKey(process.env.SEND_GRID_KEY);
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from: process.env.NODEMAILER_USER_EMAIL,
      to,
      subject,
      text: text || 'Hello',
      html,
    };

    try {
      if (process.env.NODE_ENV === 'prod') {
        const info = await SendGrid.send(mailOptions);
        return info;
      } else {
      const info = await this.transporter.sendMail(mailOptions);
      return info.messageId;
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async renderTemplate(templatePath: string, data: any): Promise<string> {
    const template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
    return template(data);
  }
}
