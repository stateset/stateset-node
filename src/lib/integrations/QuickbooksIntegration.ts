import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum QuickbooksInvoiceStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  OVERDUE = 'Overdue',
  PAID = 'Paid',
  VOID = 'Void',
}

export enum QuickbooksAccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

// Core Interfaces
export interface QuickbooksInvoice {
  Id: NonEmptyString<string>;
  SyncToken: string; // For optimistic locking
  DocNumber: string;
  TxnDate: Timestamp;
  CustomerRef: {
    value: string;
    name?: string;
  };
  Line: Array<{
    Id?: string;
    LineNum?: number;
    Amount: number;
    DetailType: 'SalesItemLineDetail' | 'SubTotalLineDetail' | 'DiscountLineDetail';
    SalesItemLineDetail?: {
      ItemRef: { value: string; name?: string };
      Qty?: number;
      UnitPrice?: number;
    };
  }>;
  TotalAmt: number;
  Balance: number;
  DueDate?: Timestamp;
  Status: QuickbooksInvoiceStatus;
  MetaData: {
    CreateTime: Timestamp;
    LastUpdatedTime: Timestamp;
  };
}

export interface QuickbooksAccount {
  Id: NonEmptyString<string>;
  SyncToken: string;
  Name: string;
  AcctNum?: string;
  AccountType: QuickbooksAccountType;
  Classification: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  CurrentBalance: number;
  CurrencyRef: { value: string; name?: string };
  Active: boolean;
  MetaData: {
    CreateTime: Timestamp;
    LastUpdatedTime: Timestamp;
  };
}

export interface QuickbooksContact {
  Id: NonEmptyString<string>;
  SyncToken: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1: string;
    City: string;
    State: string;
    PostalCode: string;
    Country: string;
  };
  Active: boolean;
  ContactType: 'Customer' | 'Vendor';
  MetaData: {
    CreateTime: Timestamp;
    LastUpdatedTime: Timestamp;
  };
}

export interface QuickbooksPayment {
  Id: NonEmptyString<string>;
  SyncToken: string;
  TxnDate: Timestamp;
  CustomerRef: { value: string; name?: string };
  TotalAmt: number;
  PaymentMethodRef?: { value: string; name?: string };
  DepositToAccountRef?: { value: string; name?: string };
  Line: Array<{
    Amount: number;
    LinkedTxn: Array<{
      TxnId: string;
      TxnType: 'Invoice' | 'Payment';
    }>;
  }>;
  MetaData: {
    CreateTime: Timestamp;
    LastUpdatedTime: Timestamp;
  };
}

// Error Classes
export class QuickbooksIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'QuickbooksIntegrationError';
  }
}

export default class QuickbooksIntegration extends BaseIntegration {
  constructor(
    apiKey: NonEmptyString<string>,
    baseUrl: string = 'https://quickbooks.api.intuit.com'
  ) {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new QuickbooksIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getInvoices(
    params: {
      query?: string; // SQL-like query, e.g., "SELECT * FROM Invoice WHERE Metadata.LastUpdatedTime > '2023-01-01'"
      limit?: number; // QuickBooks caps at 1000
      offset?: number;
    } = {}
  ): Promise<{
    invoices: QuickbooksInvoice[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
      return {
        invoices: response.QueryResponse.Invoice || [],
        pagination: {
          total: response.QueryResponse.totalCount || response.QueryResponse.Invoice?.length || 0,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to fetch invoices', { originalError: error });
    }
  }

  public async createInvoice(
    data: Omit<QuickbooksInvoice, 'Id' | 'SyncToken' | 'MetaData'>
  ): Promise<QuickbooksInvoice> {
    this.validateRequestData(data, ['CustomerRef', 'Line', 'TotalAmt']);
    try {
      const response = await this.request('POST', 'v3/company/{companyId}/invoice', {
        Invoice: data,
      });
      return response.Invoice;
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to create invoice', { originalError: error });
    }
  }

  public async getAccounts(
    params: {
      query?: string; // e.g., "SELECT * FROM Account WHERE AccountType = 'Income'"
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    accounts: QuickbooksAccount[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
      return {
        accounts: response.QueryResponse.Account || [],
        pagination: {
          total: response.QueryResponse.totalCount || response.QueryResponse.Account?.length || 0,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to fetch accounts', { originalError: error });
    }
  }

  public async createAccount(
    data: Omit<QuickbooksAccount, 'Id' | 'SyncToken' | 'MetaData'>
  ): Promise<QuickbooksAccount> {
    this.validateRequestData(data, ['Name', 'AccountType']);
    try {
      const response = await this.request('POST', 'v3/company/{companyId}/account', {
        Account: data,
      });
      return response.Account;
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to create account', { originalError: error });
    }
  }

  public async getContacts(
    params: {
      query?: string; // e.g., "SELECT * FROM Customer WHERE Active = true"
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    contacts: QuickbooksContact[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
      return {
        contacts: response.QueryResponse.Customer || response.QueryResponse.Vendor || [],
        pagination: {
          total:
            response.QueryResponse.totalCount ||
            (response.QueryResponse.Customer || response.QueryResponse.Vendor)?.length ||
            0,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to fetch contacts', { originalError: error });
    }
  }

  public async createContact(
    data: Omit<QuickbooksContact, 'Id' | 'SyncToken' | 'MetaData'>
  ): Promise<QuickbooksContact> {
    this.validateRequestData(data, ['DisplayName', 'ContactType']);
    try {
      const endpoint = data.ContactType === 'Customer' ? 'customer' : 'vendor';
      const response = await this.request('POST', `v3/company/{companyId}/${endpoint}`, {
        [data.ContactType]: data,
      });
      return response[data.ContactType];
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to create contact', { originalError: error });
    }
  }

  public async getPayments(
    params: {
      query?: string; // e.g., "SELECT * FROM Payment WHERE TotalAmt > 100"
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    payments: QuickbooksPayment[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
      return {
        payments: response.QueryResponse.Payment || [],
        pagination: {
          total: response.QueryResponse.totalCount || response.QueryResponse.Payment?.length || 0,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to fetch payments', { originalError: error });
    }
  }

  public async createPayment(
    data: Omit<QuickbooksPayment, 'Id' | 'SyncToken' | 'MetaData'>
  ): Promise<QuickbooksPayment> {
    this.validateRequestData(data, ['CustomerRef', 'TotalAmt']);
    try {
      const response = await this.request('POST', 'v3/company/{companyId}/payment', {
        Payment: data,
      });
      return response.Payment;
    } catch (error: any) {
      throw new QuickbooksIntegrationError('Failed to create payment', { originalError: error });
    }
  }
}
