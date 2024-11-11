import { stateset } from '../../stateset-client';
type PackingListStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'SHIPPED' | 'CANCELLED';
interface BasePackingListResponse {
    id: string;
    object: 'packinglist';
    status: PackingListStatus;
}
interface DraftPackingListResponse extends BasePackingListResponse {
    status: 'DRAFT';
    draft: true;
}
interface SubmittedPackingListResponse extends BasePackingListResponse {
    status: 'SUBMITTED';
    submitted: true;
}
interface VerifiedPackingListResponse extends BasePackingListResponse {
    status: 'VERIFIED';
    verified: true;
}
interface ShippedPackingListResponse extends BasePackingListResponse {
    status: 'SHIPPED';
    shipped: true;
}
interface CancelledPackingListResponse extends BasePackingListResponse {
    status: 'CANCELLED';
    cancelled: true;
}
type PackingListResponse = DraftPackingListResponse | SubmittedPackingListResponse | VerifiedPackingListResponse | ShippedPackingListResponse | CancelledPackingListResponse;
interface PackageItem {
    purchase_order_item_id: string;
    quantity: number;
    lot_number?: string;
    serial_numbers?: string[];
    expiration_date?: string;
}
interface Package {
    package_number: string;
    weight?: number;
    weight_unit?: 'LB' | 'KG';
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'IN' | 'CM';
    };
    items: PackageItem[];
}
interface PackingListData {
    purchase_order_id: string;
    shipment_date: string;
    packages: Package[];
    warehouse_id?: string;
    warehouse_location?: string;
    special_instructions?: string;
    hazmat_info?: {
        un_number?: string;
        class_division?: string;
        packing_group?: string;
    };
    quality_check?: {
        inspector: string;
        inspection_date: string;
        notes: string;
    };
    [key: string]: any;
}
declare class PackingList {
    private stateset;
    constructor(stateset: stateset);
    private handleCommandResponse;
    list(): Promise<PackingListResponse[]>;
    get(packingListId: string): Promise<PackingListResponse>;
    create(packingListData: PackingListData): Promise<PackingListResponse>;
    update(packingListId: string, packingListData: Partial<PackingListData>): Promise<PackingListResponse>;
    delete(packingListId: string): Promise<void>;
    submit(packingListId: string): Promise<SubmittedPackingListResponse>;
    verify(packingListId: string, verificationDetails: {
        verified_by: string;
        verification_date: string;
        verification_notes?: string;
    }): Promise<VerifiedPackingListResponse>;
    markShipped(packingListId: string, shippingDetails: {
        shipped_date: string;
        shipped_by: string;
        shipping_notes?: string;
    }): Promise<ShippedPackingListResponse>;
    cancel(packingListId: string): Promise<CancelledPackingListResponse>;
    addPackage(packingListId: string, packageData: Package): Promise<PackingListResponse>;
    updatePackage(packingListId: string, packageNumber: string, packageData: Partial<Package>): Promise<PackingListResponse>;
    removePackage(packingListId: string, packageNumber: string): Promise<PackingListResponse>;
    addItemToPackage(packingListId: string, packageNumber: string, item: PackageItem): Promise<PackingListResponse>;
    removeItemFromPackage(packingListId: string, packageNumber: string, purchaseOrderItemId: string): Promise<PackingListResponse>;
    updateQualityCheck(packingListId: string, qualityCheckData: PackingListData['quality_check']): Promise<PackingListResponse>;
}
export default PackingList;
