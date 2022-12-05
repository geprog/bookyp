import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
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

const spaceBookingAdminMailTemplate = handlebars.compile(`
Moin!

"{{ user }}" hat den Tisch "{{ table }}" in deinem Space "{{ space }}" von {{ start }} bis {{ end }} gebucht.

Um die Buchung zu sehen, klicke hier: {{ bookingLink }}

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

export async function sendSpaceBookingAdminMail(
  space: Model.Space,
  email: string,
  user: Model.User,
  currentBookable: Model.Bookable,
  booking: Partial<Model.Booking>,
): Promise<void> {
  if (!transporter) {
    return;
  }

  if (booking.start === undefined || booking.end === undefined) {
    throw new Error('No start and end Date for Booking found.');
  }

  const start = dayjs(booking.start).format('DD.MM.YYYY HH:mm');
  const end = dayjs(booking.end).format('DD.MM.YYYY HH:mm');

  const { frontendUrl } = config().app;

  if (!booking._id) {
    throw new Error('No booking id found.');
  }

  if (!frontendUrl) {
    throw new Error('No frontendUrl configured.');
  }

  const bookingLink = `${frontendUrl}account/${booking._id}`;
  const text = spaceBookingAdminMailTemplate({
    space: space.name,
    user: user.name,
    table: currentBookable.name,
    start,
    end,
    bookingLink,
    email,
  });

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: email,
      // cspell:disable-next-line
      subject: `Neue Buchung in "${space.name}".`,
      text,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending new booking mail', error);
  }
}
