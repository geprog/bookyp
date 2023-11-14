import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';

import config from '~/config';
import {
  invitationMailTemplate,
  spaceBookingAdminMailTemplate,
  spaceBookingChangedMailTemplate,
  spaceBookingDeletedMailTemplate,
  spaceBookingRequestAcceptMailTemplate,
  spaceBookingRequestAdminMailTemplate,
  spaceBookingRequestRejectMailTemplate,
} from '~/mail-templates.de';

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

export async function sendSpaceInvitationMail(space: Model.Space, email: string, admin: Model.Member): Promise<void> {
  if (!transporter) {
    return;
  }

  const invitationLink = `${config().app.frontendUrl || ''}/auth/login`;
  const text = invitationMailTemplate.body({
    space: space.name,
    invitationLink,
    email,
    admin,
  });

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: email,
      subject: invitationMailTemplate.subject({ space: space.name }),
      text,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending invitation mail', error);
  }
}

export async function sendAdminNotification(
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

  const bookingLink = booking.request
    ? `${frontendUrl}/space/${space._id}/settings/request-details/${booking._id}`
    : `${frontendUrl}/account/booking/${booking._id}`;

  const emailParameters = {
    space: space.name,
    user: user.name,
    table: currentBookable.name,
    start,
    end,
    bookingLink,
    email,
  };

  const emailMessage = booking.request
    ? spaceBookingRequestAdminMailTemplate.body(emailParameters)
    : spaceBookingAdminMailTemplate.body(emailParameters);

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: email,
      subject: booking.request
        ? spaceBookingRequestAdminMailTemplate.subject({ space: space.name })
        : spaceBookingAdminMailTemplate.subject({ space: space.name }),
      text: emailMessage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending new booking mail', error);
  }
}

export async function sendRequestReplyNotification(
  space: Model.Space,
  email: string,
  currentBookable: Model.Bookable,
  booking: Partial<Model.Booking>,
  accept: boolean,
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

  const bookingLink = `${frontendUrl}/account/booking/${booking._id}`;

  const emailParameters = {
    space: space.name,
    table: currentBookable.name,
    start,
    end,
    bookingLink,
  };

  const emailMessage = accept
    ? spaceBookingRequestAcceptMailTemplate.body(emailParameters)
    : spaceBookingRequestRejectMailTemplate.body(emailParameters);

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: email,
      subject: accept ? spaceBookingRequestAcceptMailTemplate.subject : spaceBookingRequestRejectMailTemplate.subject,
      text: emailMessage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending new booking mail', error);
  }
}

export async function sendUserBookingNotification(
  space: Model.Space,
  user: Model.User,
  currentBookable: Model.Bookable,
  oldBooking: Partial<Model.Booking>,
  booking: Partial<Model.Booking>,
): Promise<void> {
  if (!transporter) {
    return;
  }

  if (booking.start === undefined || booking.end === undefined) {
    throw new Error('No start and end Date for Booking found.');
  }

  const oldStart = dayjs(oldBooking.start).format('DD.MM.YYYY HH:mm');
  const oldEnd = dayjs(oldBooking.end).format('DD.MM.YYYY HH:mm');

  const start = dayjs(booking.start).format('DD.MM.YYYY HH:mm');
  const end = dayjs(booking.end).format('DD.MM.YYYY HH:mm');

  const { frontendUrl } = config().app;

  if (!booking._id) {
    throw new Error('No booking id found.');
  }

  if (!frontendUrl) {
    throw new Error('No frontendUrl configured.');
  }

  const bookingLink = `${frontendUrl}/account/booking/${booking._id}`;
  const spaceInfoLink = `${frontendUrl}/space/${space._id}/info`;

  const emailParameters = {
    space: space.name,
    user: user.name,
    table: currentBookable.name,
    start,
    end,
    oldStart,
    oldEnd,
    bookingLink,
    spaceInfoLink,
  };

  const emailMessage = booking.deleted
    ? spaceBookingDeletedMailTemplate.body(emailParameters)
    : spaceBookingChangedMailTemplate.body(emailParameters);

  try {
    await transporter.sendMail({
      from: config().mail.from,
      to: user.email,
      subject: booking.deleted
        ? spaceBookingDeletedMailTemplate.subject({ space: space.name })
        : spaceBookingChangedMailTemplate.subject({ space: space.name }),
      text: emailMessage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Problem sending new booking mail', error);
  }
}
