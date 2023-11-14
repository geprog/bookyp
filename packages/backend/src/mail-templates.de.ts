import handlebars from 'handlebars';

export const invitationMailTemplate = {
  subject: handlebars.compile(`Du wurdest zum Space "{{ space }}" eingeladen`),
  body: handlebars.compile(`
Moin!

Du wurdest zum Space "{{ space }}" von {{ admin.name }} bei Bookyp eingeladen.

Um dem Space beizutreten, klicke hier: {{ invitationLink }}

Falls du noch keinen Account bei Bookyp hast, kannst du dich dort kostenfrei mit deiner E-Mail ({{ email }}) registrieren.

Daraufhin kannst du sofort loslegen und dir deinen Tisch im Space "{{ space }}" buchen.

Bei Fragen oder Anregungen schreibe uns gerne an hello@bookyp.de.

Wir wünschen dir viel Spaß mit Bookyp!

Dein Bookyp-Team
`),
};

export const spaceBookingAdminMailTemplate = {
  subject: handlebars.compile(`Neue Buchung in "{{ space }}"`),
  body: handlebars.compile(`
Moin!

"{{ user }}" hat den Tisch "{{ table }}" in deinem Space "{{ space }}" von {{ start }} bis {{ end }} gebucht.

Um die Buchung zu sehen, klicke hier: {{ bookingLink }}

Dein Bookyp-Team
`),
};

export const spaceBookingRequestAdminMailTemplate = {
  subject: handlebars.compile(`Neue Buchungsanfrage in "{{ space }}"`),
  body: handlebars.compile(`
Moin!

"{{ user }}" hat den Tisch "{{ table }}" in deinem Space "{{ space }}" von {{ start }} bis {{ end }} angefragt.

Um die Anfrage zu sehen, klicke hier: {{ bookingLink }} .

Du kannst die Anfrage dort akzeptieren oder ablehnen.

Dein Bookyp-Team

`),
};

export const spaceBookingRequestAcceptMailTemplate = {
  subject: `Buchungsanfrage akzeptiert`,
  body: handlebars.compile(`
Moin!

deine Buchungsanfrage für den Tisch "{{ table }}" im Space "{{ space }}" von {{ start }} bis {{ end }} wurde akzeptiert.

Um die Buchung zu sehen, klicke hier: {{ bookingLink }} .

Dein Bookyp-Team

`),
};

export const spaceBookingRequestRejectMailTemplate = {
  subject: `Buchungsanfrage abgelehnt`,
  body: handlebars.compile(`
Moin!

deine Buchungsanfrage für den Tisch "{{ table }}" im Space "{{ space }}" von {{ start }} bis {{ end }} wurde abgelehnt.

Um die Buchung zu sehen, klicke hier: {{ bookingLink }} .

Dein Bookyp-Team
`),
};

export const spaceBookingDeletedMailTemplate = {
  subject: handlebars.compile(`Deine Buchung in "{{ space }}" wurde gelöscht`),
  body: handlebars.compile(`
Moin!

deine Buchung für den Tisch "{{ table }}" im Space "{{ space }}" von {{ start }} bis {{ end }} wurde gelöscht.

Falls du Fragen dazu hast, wende dich bitte an den Spacebetreiber. Die Infos dafür findest du hier: {{ spaceInfoLink }}

Um die Buchung zu sehen, klicke hier: {{ bookingLink }}

Dein Bookyp-Team
`),
};

export const spaceBookingChangedMailTemplate = {
  subject: handlebars.compile(`Deine Buchung in "{{ space }}" wurde geändert`),
  body: handlebars.compile(`
Moin!

deine Buchung für den Tisch "{{ table }}" im Space "{{ space }}" von {{ oldStart }} bis {{ oldEnd }} wurde auf {{ start }} bis {{ end }} geändert.

Falls du Fragen dazu hast, wende dich bitte an den Spacebetreiber. Die Infos dafür findest du hier: {{ spaceInfoLink }}

Um die Buchung zu sehen, klicke hier: {{ bookingLink }}

Dein Bookyp-Team
`),
};
