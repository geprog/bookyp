import process from 'node:process';
import { config as dotenv } from 'dotenv';

/**
 * Format of `export.json` written by `export.ts` and read by `import.ts`. Ids of users and spaces
 * are the MongoDB ids (the same in v1 and v2), the others are the ids in gringotts.
 */
export interface GringottsExport {
  version: 1;
  exportedAt: string;
  customers: ExportedCustomer[];
  subscriptions: ExportedSubscription[];
  invoices: ExportedInvoice[];
}

export interface ExportedCustomer {
  gringottsId: string;
  /** v1 user the customer belongs to (null if no user links to it anymore) */
  userId: string | null;
  userEmail: string | null;
  name: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  city: string;
  /** free text as typed in v1, e.g. "Deutschland" */
  country: string;
  language: string;
  /** net credit, e.g. from the payment method verification */
  balance: number;
  mollieCustomerId: string;
  /** Mollie id of the active payment method */
  mollieMandateId: string | null;
}

export interface ExportedSubscription {
  gringottsId: string;
  /** v1 space the subscription belongs to */
  spaceId: string;
  spaceName: string;
  plan: string;
  status: string;
  customerGringottsId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  /** net price of the current period, still unbilled as gringotts bills at the end of a period */
  openPeriodNet: number;
}

export interface ExportedInvoice {
  gringottsId: string;
  number: string;
  date: string;
  status: string;
  spaceId: string | null;
  customerGringottsId: string;
  currency: string;
  vatRate: number;
  items: { description: string; units: number; pricePerUnit: number }[];
  amount: number;
  vatAmount: number;
  totalAmount: number;
  /** path of the original pdf relative to the export folder (null if it could not be downloaded) */
  pdf: string | null;
}

export function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function env(name: string, required = false): string {
  const value = process.env[name] ?? '';
  if (required && !value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/** the value after a command line flag, e.g. `--dir export` */
export function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

/** loads the env file given with `--env-file` */
export function loadEnvFile(args: string[]): void {
  const envFile = argValue(args, '--env-file');
  if (envFile) {
    const { error } = dotenv({ path: envFile, quiet: true });
    if (error) {
      throw error;
    }
  }
}

/**
 * The net price of a gringotts period as gringotts would have billed it: every plan change
 * within the period is charged for the share of the period it was active.
 */
export function gringottsPeriodPrice(changes: { start: Date; end: Date | null; pricePerUnit: number; units: number }[], start: Date, end: Date): number {
  const sorted = [...changes].sort((a, b) => a.start.getTime() - b.start.getTime());
  const length = end.getTime() - start.getTime();
  let total = 0;
  sorted.forEach((change, i) => {
    const changeEnd = change.end ?? sorted[i + 1]?.start ?? end;
    const from = Math.max(change.start.getTime(), start.getTime());
    const to = Math.min(changeEnd.getTime(), end.getTime());
    if (to > from) {
      total += change.pricePerUnit * change.units * ((to - from) / length);
    }
  });
  return roundPrice(total);
}

/** prints one line of the report */
export function report(section: string, name: string, result: string): void {
  console.log(`${section.padEnd(13)} ${name.padEnd(32)} ${result}`);
}
