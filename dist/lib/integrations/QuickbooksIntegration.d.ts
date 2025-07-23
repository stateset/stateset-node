import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum QuickbooksInvoiceStatus {
    DRAFT = "Draft",
    OPEN = "Open",
    OVERDUE = "Overdue",
    PAID = "Paid",
    VOID = "Void"
}
export declare enum QuickbooksAccountType {
    ASSET = "Asset",
    LIABILITY = "Liability",
    EQUITY = "Equity",
    INCOME = "Income",
    EXPENSE = "Expense"
}
export interface QuickbooksInvoice {
    Id: NonEmptyString<string>;
    SyncToken: string;
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
            ItemRef: {
                value: string;
                name?: string;
            };
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
    CurrencyRef: {
        value: string;
        name?: string;
    };
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
    PrimaryEmailAddr?: {
        Address: string;
    };
    PrimaryPhone?: {
        FreeFormNumber: string;
    };
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
    CustomerRef: {
        value: string;
        name?: string;
    };
    TotalAmt: number;
    PaymentMethodRef?: {
        value: string;
        name?: string;
    };
    DepositToAccountRef?: {
        value: string;
        name?: string;
    };
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
export declare class QuickbooksIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class QuickbooksIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getInvoices(params?: {
        query?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        invoices: QuickbooksInvoice[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createInvoice(data: Omit<QuickbooksInvoice, 'Id' | 'SyncToken' | 'MetaData'>): Promise<QuickbooksInvoice>;
    getAccounts(params?: {
        query?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        accounts: QuickbooksAccount[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createAccount(data: Omit<QuickbooksAccount, 'Id' | 'SyncToken' | 'MetaData'>): Promise<QuickbooksAccount>;
    getContacts(params?: {
        query?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        contacts: QuickbooksContact[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createContact(data: Omit<QuickbooksContact, 'Id' | 'SyncToken' | 'MetaData'>): Promise<QuickbooksContact>;
    getPayments(params?: {
        query?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        payments: QuickbooksPayment[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createPayment(data: Omit<QuickbooksPayment, 'Id' | 'SyncToken' | 'MetaData'>): Promise<QuickbooksPayment>;
}
export {};
//# sourceMappingURL=QuickbooksIntegration.d.ts.map