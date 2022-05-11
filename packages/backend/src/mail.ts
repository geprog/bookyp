import { Model } from '@bookyp/core';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';

import config from '~/config';

let transporter: nodemailer.Transporter;

export function init(): void {
  const mailConfig = config().mail;

  if (!mailConfig.host || !mailConfig.port || !mailConfig.username || !mailConfig.password) {
    // eslint-disable-next-line no-console
    console.log('No mail config found, skipping mail initialization');
    return;
  }

  transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    requireTLS: mailConfig.requireTLS,
    auth: {
      user: mailConfig.username,
      pass: mailConfig.password,
    },
  });
}

/* spell-checker: disable */
const invitationMailTemplate = handlebars.compile(`
Moin!

Du wurdest zum Space "{{ space }}" von {{ admin.name }} bei Bookyp eingeladen.

Um dem Space beizutreten, klicke hier: {{ invitationLink }}

Falls du noch keinen Account bei Bookyp hast, kannst du dich dort kostenfrei mit deiner E-Mail ({{ email }}) registrieren.

Daraufhin kannst du sofort loslegen und dir deinen Tisch im Space "{{ space }}" buchen.

Bei Fragen oder Anregungen schreibe uns gerne an bookyp@geprog.com.

Wir wünschen dir viel Spaß mit Bookyp!

Dein Bookyp-Team
`);
/* spell-checker: enable */

export async function sendSpaceInvitationMail(space: Model.Space, email: string, admin: Model.Member): Promise<void> {
  if (!transporter) {
    return;
  }

  const invitationLink = `${config().app.frontendUrl || ''}/spaces`;
  const text = invitationMailTemplate({
    space: space.name,
    invitationLink,
    email,
    admin,
  });

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: email,
      subject: `You have been invited to "${space.name}"`,
      text,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending invitation mail', error);
  }
}
