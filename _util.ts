export default class Util {
  private static MONEY_FORMATTER =
      new Intl.NumberFormat('en-us', {
        currency: "USD",
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
      });

  private static DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

  static formatMoney(amount: number): string {
    let formatted = this.MONEY_FORMATTER.format(amount);
    if (amount < 0) {
      // Insert the dollar sign after the negative.
      formatted = `-$${formatted.substring(1)}`;
    } else {
      formatted = `$${formatted}`;
    }
    return formatted;
  }

  /** Returns date string of the form 'today' or 'on Jul 13'. */
  static dateString(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateCopy = new Date(date.getTime());
    dateCopy.setHours(0, 0, 0, 0);
    
    if (today.getTime() === dateCopy.getTime()) return 'today';

    const yesterday = new Date(today.getTime() - Util.DAY_IN_MILLIS);
    if (yesterday.getTime() === dateCopy.getTime()) return 'yesterday';

    const tomorrow = new Date(today.getTime() + Util.DAY_IN_MILLIS);
    if (tomorrow.getTime() === dateCopy.getTime()) return 'tomorrow';

    return `on ${
        Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMM dd')}`;
  }

  static getNextDayOfMonth(dayOfMonth: number): Date {
    Util.validateRecurringDayOfMonth(dayOfMonth);
    const date = new Date();
    date.setDate(dayOfMonth);
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  static getNextDayOfMonthString(dayOfMonth: number): string {
    return Util.dateString(Util.getNextDayOfMonth(dayOfMonth));
  }

  /** Validates that `day` is in [1, 28], making it valid in every month. */
  static validateRecurringDayOfMonth(day: number) {
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      throw new Error('Day of month must be a whole number from 1 to 28 to ' +
          `valid in all months. Got ${day}`);
    }
  }
}