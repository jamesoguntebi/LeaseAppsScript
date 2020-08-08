import BalanceSheet from './balance_sheet';
import ClientSheetManager from './client_sheet_manager';
import EmailChecker from './email_checker';

const LEASE_TEMPLATE_SPREADSHEET_ID =
    '1e-xDkyts6jt_2JPGS5i1hX4opVJ9niQ9f0y8YtAvTlw';

_JasLibContext = {
  spreadsheetId: ''
};

export function template_dailyBalanceUpdate() {
  _JasLibContext.spreadsheetId = LEASE_TEMPLATE_SPREADSHEET_ID;
  return Executrix.run(() => BalanceSheet.dailyUpdate());
}

export function template_checkLabeledEmails() {
  _JasLibContext.spreadsheetId = LEASE_TEMPLATE_SPREADSHEET_ID;
  return Executrix.run(() => {
    EmailChecker.checkLabeledEmails();
  });
}

export function registerClientSheet(spreadsheetId: string) {
  return Executrix.run(() => ClientSheetManager.register(spreadsheetId));
}

export function unregisterClientSheet(spreadsheetId: string) {
  return Executrix.run(() => ClientSheetManager.unregister(spreadsheetId));
}

export function testing(spreadsheetId: string) {
  _JasLibContext.spreadsheetId = spreadsheetId;
  return Executrix.run(() => ({result: 'testing'}));
}

export class Executrix {
  static run(job: () => JobRun | void): string {
    const start = Date.now();
    const jobRun = job();

    Logger.log(`Runtime: ${Date.now() - start} ms`);
    let resultString = Logger.getLog();

    if (jobRun && jobRun.result) {
      resultString = `Result: ${jobRun.result}\n\n${resultString}`;
    }

    return '\n' + resultString;
  }
}

interface JobRun {
  result?: any;
}
