import Config from "./config";
import BalanceSheet from "./balance_sheet";
import Util from "./util";

export default class EmailSender {
  static sendPaymentThanks(amount: number) {
    const config = Config.get();
    const balanceNum = BalanceSheet.getBalance();

    let balanceColor: string;
    if (config.rentConfig && balanceNum) {
      balanceColor = balanceNum > 0 ? '#b34' : '#192';
    }

    const templateParams: PaymentEmailTemplateParams = {
      balance: Util.formatMoney(balanceNum),
      balanceColor,
      linkHref: config.linkToSheetHref,
      linkText: config.linkToSheetText,
      paymentAmount: Util.formatMoney(amount),
      customerDisplayName: config.customerDisplayName,
    };

    const nonHtmlBody = `Thank you for your payment of ${
        templateParams.paymentAmount}. Your balance is now $${
        templateParams.balance}.\n\nSee balance sheet: ${
        templateParams.linkHref}`;

    const template =
        HtmlService.createTemplateFromFile('email_template_payment');
    template.templateParams = templateParams;

    GmailApp.sendEmail(
        config.customerEmails.join(', '),
        'Received your payment - Thanks!',
        nonHtmlBody,
        {
          bcc: config.emailBCCs.join(', '),
          cc: config.emailCCs.join(', '),
          name: config.emailDisplayName,
          htmlBody: template.evaluate().getContent(),
        });
  }
}

/** Keep in sync with email_template_payment.html. */
interface PaymentEmailTemplateParams {
  balance: string,
  balanceColor: string,
  customerDisplayName: string,
  linkHref: string,
  linkText: string,
  paymentAmount: string,
}