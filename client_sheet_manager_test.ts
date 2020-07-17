import { Test } from "./testing/testrunner";
import { Tester } from "./testing/tester";
import Config from "./config";
import BalanceSheet from "./balance_sheet";
import ClientSheetManager from "./client_sheet_manager";

export default class ClientSheetManagerTest implements Test {
  readonly name = 'ClientSheetManagerTest';

  private expectRegisteredCount(t: Tester, expected: number) {
    let count = 0;
    ClientSheetManager.forEach(() => count++);
    t.expect(count).toEqual(expected);
  }

  run (t: Tester) {
    let forceConfigSheetInvalid = false;
    let forceBalanceSheetInvalid = false;

    t.beforeEach(() => {
      const fakeProperties = new FakeProperties();
      t.spyOn(PropertiesService, 'getScriptProperties').and
          .callFake(() => fakeProperties);
      t.spyOn(Config, 'get').and.callFake(() => {
        if (forceConfigSheetInvalid) throw new Error('Config is invalid');
      });
      t.spyOn(BalanceSheet, 'validateActiveSheet').and.callFake(() => {
        if (forceBalanceSheetInvalid) {
          throw new Error('Balance sheet is invalid');
        }
      });
      t.spyOn(SpreadsheetApp, 'flush');
      t.spyOn(Utilities, 'sleep');
    });

    t.describe('regsiter', () => {
      t.beforeEach(() => this.expectRegisteredCount(t, 0));

      t.it('registers valid spreadsheets', () => {
        forceConfigSheetInvalid = false;
        forceBalanceSheetInvalid = false;
        ClientSheetManager.register('sheet-id');
        this.expectRegisteredCount(t, 1);
      });

      t.it('skips a spreadsheet with an invalid config', () => {
        forceConfigSheetInvalid = true;
        forceBalanceSheetInvalid = false;
        ClientSheetManager.register('sheet-id');
        this.expectRegisteredCount(t, 0);
      });

      t.it('skips a spreadsheet with an invalid balance sheet', () => {
        forceConfigSheetInvalid = false;
        forceBalanceSheetInvalid = true;
        ClientSheetManager.register('sheet-id');
        this.expectRegisteredCount(t, 0);
      });

      t.it('skips an already registered spreadsheet', () => {
        forceConfigSheetInvalid = false;
        forceBalanceSheetInvalid = false;
        ClientSheetManager.register('sheet-id');
        this.expectRegisteredCount(t, 1);

        ClientSheetManager.register('sheet-id');
        this.expectRegisteredCount(t, 1);
      });
    });

    t.describe('unregsiter', () => {
      t.beforeEach(() => {
        forceConfigSheetInvalid = false;
        forceBalanceSheetInvalid = false;
        ClientSheetManager.register('sheet-1');
        ClientSheetManager.register('sheet-2');
        this.expectRegisteredCount(t, 2);
      });

      t.it('unregisters existing spreadsheets', () => {
        ClientSheetManager.unregister('sheet-1');
        this.expectRegisteredCount(t, 1);
      });

      t.it('skips unknown spreadsheets', () => {
        ClientSheetManager.unregister('some unknown spreadsheet');
        this.expectRegisteredCount(t, 2);
      });

      t.it('skips already unregistered spreadsheets', () => {
        ClientSheetManager.unregister('sheet-1');
        this.expectRegisteredCount(t, 1);

        ClientSheetManager.unregister('sheet-1');
        this.expectRegisteredCount(t, 1);
      });
    });

    t.describe('forEach', () => {
      const eachFn = () => {};
      const observer = {eachFn};

      t.beforeEach(() => {
        forceConfigSheetInvalid = false;
        forceBalanceSheetInvalid = false;
        ClientSheetManager.register('sheet-1');
        ClientSheetManager.register('sheet-2');
        ClientSheetManager.register('sheet-3');

        t.spyOn(observer, 'eachFn');
      });

      t.it('touches every registered sheet', () => {
        ClientSheetManager.forEach(observer.eachFn);
        t.expect(observer.eachFn).toHaveBeenCalledTimes(3);
        t.expect(observer.eachFn).toHaveBeenCalledWith('sheet-1');
        t.expect(observer.eachFn).toHaveBeenCalledWith('sheet-2');
        t.expect(observer.eachFn).toHaveBeenCalledWith('sheet-3');
      });

      t.it('flushes each sheet', () => {
        ClientSheetManager.forEach(eachFn);
        t.expect(SpreadsheetApp.flush).toHaveBeenCalledTimes(3);
      });

      t.it('sleeps after every sheet', () => {
        ClientSheetManager.forEach(eachFn);
        t.expect(Utilities.sleep).toHaveBeenCalledTimes(3);
      });
    });
  }
}

class FakeProperties {
  private readonly properties = new Map<string, string>();

  deleteAllProperties() {
    this.properties.clear();
    return this;
  }
  deleteProperty(key: string) {
    this.properties.delete(key);
    return this;
  }
  getKeys() {
    return Array.from(this.properties.keys());
  }
  getProperties(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const [key, value] of this.properties) {
      obj[key] = value;
    }
    return obj;
  }
  getProperty(key: string): string {
    return this.properties.get(key);
  }
  setProperties(properties: Record<string, string>, deleteAllOthers?: boolean) {
    deleteAllOthers ?? this.properties.clear();

    for (const key in properties) {
      this.properties.set(key, properties[key]);
    }
  }
  setProperty(key: string, value: string) {
    this.properties.set(key, value);
  }
}








//DriveApp.getFileById(spreadsheet.getId()).setTrashed(true);

