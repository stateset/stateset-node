export default class Locations {
    private client;
    constructor(client: any);
    /**
     * Create a new location
     * @param data - LocationData object
     * @returns LocationResponse object
     */
    create(data: any): Promise<any>;
    /**
     * Get a location by ID
     * @param id - Location ID
     * @returns LocationResponse object
     */
    get(id: string): Promise<any>;
    /**
     * Update a location
     * @param id - Location ID
     * @param data - Partial<LocationData> object
     * @returns LocationResponse object
     */
    update(id: string, data: any): Promise<any>;
    /**
     * List locations
     * @param params - Optional filtering parameters
     * @returns Array of LocationResponse objects
     */
    list(params?: any): Promise<any>;
    /**
     * Delete a location
     * @param id - Location ID
     */
    delete(id: string): Promise<any>;
    /**
     * Get inventory for a location
     * @param id - Location ID
     * @returns Array of InventoryResponse objects
     */
    getInventory(id: string): Promise<any>;
    /**
     * Assign a product to a location
     * @param id - Location ID
     * @param productId - Product ID
     * @param data - Partial<InventoryData> object
     * @returns InventoryResponse object
     */
    assignProduct(id: string, productId: string, data: any): Promise<any>;
}
//# sourceMappingURL=Location.d.ts.map