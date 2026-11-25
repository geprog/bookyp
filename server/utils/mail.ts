import type { Transporter } from 'nodemailer';
import type { DbBookable, DbBooking, DbSpace, DbUser } from './dbTypes';
import dayjs from 'dayjs';
import { createTransport } from 'nodemailer';

let transporter: Transporter | undefined;
let initialized = false;

function getTransporter(): Transporter | undefined {
  if (!initialized) {
    initialized = true;
    const { mail } = useRuntimeConfig();
    if (!mail.host || !mail.port || !mail.username || !mail.password) {
      console.log('📭 No mail config found, mails are not sent');
    }
    else {
      transporter = createTransport({
        host: mail.host,
        port: Number(mail.port),
        secure: Boolean(mail.secure),
        requireTLS: Boolean(mail.requireTls),
        auth: { user: mail.username, pass: mail.password },
      });
    }
  }
  return transporter;
}

/** used by tests to inject a fake transporter */
export function setMailTransporter(custom: Transporter | undefined): void {
  transporter = custom;
  initialized = custom !== undefined;
}

async function send(to: string, subject: string, text: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    return;
  }
  try {
    await transport.sendMail({ from: useRuntimeConfig().mail.from, to, subject, text });
  }
  catch (error) {
    console.error(`🔥 Problem sending mail "${subject}" to ${to}`, error);
  }
}

const formatDate = (date: Date) => dayjs(date).format('DD.MM.YYYY HH:mm');

const signature = `
Dein Bookyp-Team
`;

/**
 * Text entered by users (e.g. the name of a space) on a single line and in quotes, so it can not pose
 * as text of Bookyp (line breaks would allow to append whole paragraphs to the mail).
 */
function userText(value: string): string {
  return `"${value.replace(/\s+/g, ' ').trim()}"`;
}

/**
 * Invitations go to any address, so the text entered by the admin is clearly marked as such:
 * otherwise the mail could be used for phishing in the name of Bookyp.
 */
export async function sendSpaceInvitationMail(appUrl: string, space: DbSpace, email: string, admin: Pick<DbUser, 'name' | 'email'>): Promise<void> {
  const invitedBy = admin.name ? `${userText(admin.name)} (${admin.email})` : admin.email;
  await send(
    email,
    `Bookyp-Einladung zum Space: ${userText(space.name)}`,
    `
Moin!

Du wurdest bei Bookyp in einen Space eingeladen.

Space: ${userText(space.name)}
Eingeladen von: ${invitedBy}

Um dem Space beizutreten, klicke hier: ${appUrl}/auth/login

Falls du noch keinen Account bei Bookyp hast, kannst du dich dort kostenfrei mit deiner E-Mail (${email}) registrieren.

Daraufhin kannst du sofort loslegen und dir deinen Tisch im Space buchen.

Bei Fragen oder Anregungen schreibe uns gerne an hello@bookyp.de.

Wir wünschen dir viel Spaß mit Bookyp!
${signature}`,
  );
}

/** informs the space (its contact e-mail) about a new booking or request */
export async function sendAdminBookingNotification(appUrl: string, space: DbSpace, user: Pick<DbUser, 'name' | 'email'>, bookable: DbBookable, booking: DbBooking): Promise<void> {
  if (!space.email) {
    return;
  }
  const spaceId = space._id.toString();
  const bookingId = booking._id.toString();
  const start = formatDate(booking.start);
  const end = formatDate(booking.end);
  const userName = user.name || user.email;

  if (booking.request) {
    await send(
      space.email,
      `Neue Buchungsanfrage in "${space.name}"`,
      `
Moin!

"${userName}" hat den Tisch "${bookable.name}" in deinem Space "${space.name}" von ${start} bis ${end} angefragt.

Um die Anfrage zu sehen, klicke hier: ${appUrl}/space/${spaceId}/settings/request-details/${bookingId} .

Du kannst die Anfrage dort akzeptieren oder ablehnen.
${signature}`,
    );
    return;
  }

  await send(
    space.email,
    `Neue Buchung in "${space.name}"`,
    `
Moin!

"${userName}" hat den Tisch "${bookable.name}" in deinem Space "${space.name}" von ${start} bis ${end} gebucht.

Um die Buchung zu sehen, klicke hier: ${appUrl}/account/booking/${bookingId}
${signature}`,
  );
}

/** informs the user that requested a booking about the decision of the admin */
export async function sendRequestReplyNotification(appUrl: string, space: DbSpace, user: Pick<DbUser, 'email'>, bookable: DbBookable, booking: DbBooking, accepted: boolean): Promise<void> {
  const start = formatDate(booking.start);
  const end = formatDate(booking.end);
  const bookingLink = `${appUrl}/account/booking/${booking._id.toString()}`;

  await send(
    user.email,
    accepted ? 'Buchungsanfrage akzeptiert' : 'Buchungsanfrage abgelehnt',
    `
Moin!

deine Buchungsanfrage für den Tisch "${bookable.name}" im Space "${space.name}" von ${start} bis ${end} wurde ${accepted ? 'akzeptiert' : 'abgelehnt'}.

Um die Buchung zu sehen, klicke hier: ${bookingLink} .
${signature}`,
  );
}

/** informs the user that an admin changed or deleted one of their bookings */
export async function sendUserBookingNotification(appUrl: string, space: DbSpace, user: Pick<DbUser, 'email'>, bookable: DbBookable, oldBooking: DbBooking, booking: DbBooking, deleted: boolean): Promise<void> {
  const bookingLink = `${appUrl}/account/booking/${booking._id.toString()}`;
  const spaceInfoLink = `${appUrl}/space/${space._id.toString()}/info`;

  if (deleted) {
    await send(
      user.email,
      `Deine Buchung in "${space.name}" wurde gelöscht`,
      `
Moin!

deine Buchung für den Tisch "${bookable.name}" im Space "${space.name}" von ${formatDate(booking.start)} bis ${formatDate(booking.end)} wurde gelöscht.

Falls du Fragen dazu hast, wende dich bitte an den Spacebetreiber. Die Infos dafür findest du hier: ${spaceInfoLink}

Um die Buchung zu sehen, klicke hier: ${bookingLink}
${signature}`,
    );
    return;
  }

  await send(
    user.email,
    `Deine Buchung in "${space.name}" wurde geändert`,
    `
Moin!

deine Buchung für den Tisch "${bookable.name}" im Space "${space.name}" von ${formatDate(oldBooking.start)} bis ${formatDate(oldBooking.end)} wurde auf ${formatDate(booking.start)} bis ${formatDate(booking.end)} geändert.

Falls du Fragen dazu hast, wende dich bitte an den Spacebetreiber. Die Infos dafür findest du hier: ${spaceInfoLink}

Um die Buchung zu sehen, klicke hier: ${bookingLink}
${signature}`,
  );
}

/** informs the user that pays for a space that a monthly payment failed */
export async function sendPaymentFailedMail(appUrl: string, space: DbSpace, email: string): Promise<void> {
  const until = space.activeUntil ? ` Dein Plan bleibt bis zum ${dayjs(space.activeUntil).format('DD.MM.YYYY')} aktiv, danach wechselt der Space auf den kostenlosen Plan.` : '';
  await send(
    email,
    `Zahlung für "${space.name}" fehlgeschlagen`,
    `
Moin!

die monatliche Zahlung für deinen Space "${space.name}" ist leider fehlgeschlagen.${until}

Bitte prüfe deine Zahlungsmethode oder hinterlege eine neue, hier geht es zu deinen Zahlungsdaten: ${appUrl}/space/${space._id.toString()}/settings/subscription/billing

Bei Fragen schreibe uns gerne an hello@bookyp.de.
${signature}`,
  );
}
