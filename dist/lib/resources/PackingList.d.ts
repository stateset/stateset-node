import type { ApiClientLike } from '../../types';
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
    constructor(stateset: ApiClientLike);
    private handleCommandResponse;
    /**
     * Get all packing lists
     * @returns Array of PackingListResponse objects
     */
    list(): Promise<PackingListResponse[]>;
    /**
     * Get a packing list by ID
     * @param packingListId - Packing list ID
     * @returns PackingListResponse object
     */
    get(packingListId: string): Promise<PackingListResponse>;
    /**
     * Create a new packing list
     * @param packingListData - PackingListData object
     * @returns PackingListResponse object
     */
    create(packingListData: PackingListData): Promise<PackingListResponse>;
    /**
     * Update a packing list
     * @param packingListId - Packing list ID
     * @param packingListData - Partial<PackingListData> object
     * @returns PackingListResponse object
     */
    update(packingListId: string, packingListData: Partial<PackingListData>): Promise<PackingListResponse>;
    /**
     * Delete a packing list
     * @param packingListId - Packing list ID
     */
    delete(packingListId: string): Promise<void>;
    /**
     * Submit a packing list
     * @param packingListId - Packing list ID
     * @returns SubmittedPackingListResponse object
     */
    submit(packingListId: string): Promise<SubmittedPackingListResponse>;
    /**
     * Verify a packing list
     * @param packingListId - Packing list ID
     * @param verificationDetails - Verification details object
     * @returns VerifiedPackingListResponse object
     */
    verify(packingListId: string, verificationDetails: {
        verified_by: string;
        verification_date: string;
        verification_notes?: string;
    }): Promise<VerifiedPackingListResponse>;
    /**
     * Mark a packing list as shipped
     * @param packingListId - Packing list ID
     * @param shippingDetails - Shipping details object
     * @returns ShippedPackingListResponse object
     */
    markShipped(packingListId: string, shippingDetails: {
        shipped_date: string;
        shipped_by: string;
        shipping_notes?: string;
    }): Promise<ShippedPackingListResponse>;
    /**
     * Cancel a packing list
     * @param packingListId - Packing list ID
     * @returns CancelledPackingListResponse object
     */
    cancel(packingListId: string): Promise<CancelledPackingListResponse>;
    /**
     * Add a package to a packing list
     * @param packingListId - Packing list ID
     * @param packageData - Package data object
     * @returns PackingListResponse object
     */
    addPackage(packingListId: string, packageData: Package): Promise<PackingListResponse>;
    /**
     * Update a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param packageData - Partial<Package> object
     * @returns PackingListResponse object
     */
    updatePackage(packingListId: string, packageNumber: string, packageData: Partial<Package>): Promise<PackingListResponse>;
    /**
     * Remove a package from a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @returns PackingListResponse object
     */
    removePackage(packingListId: string, packageNumber: string): Promise<PackingListResponse>;
    /**
     * Add an item to a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param item - PackageItem object
     * @returns PackingListResponse object
     */
    addItemToPackage(packingListId: string, packageNumber: string, item: PackageItem): Promise<PackingListResponse>;
    /**
     * Remove an item from a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param purchaseOrderItemId - Purchase order item ID
     * @returns PackingListResponse object
     */
    removeItemFromPackage(packingListId: string, packageNumber: string, purchaseOrderItemId: string): Promise<PackingListResponse>;
    /**
     * Update quality check for a packing list
     * @param packingListId - Packing list ID
     * @param qualityCheckData - Quality check data object
     * @returns PackingListResponse object
     */
    updateQualityCheck(packingListId: string, qualityCheckData: PackingListData['quality_check']): Promise<PackingListResponse>;
}
export default PackingList;
//# sourceMappingURL=PackingList.d.ts.map