import BaseIntegration from './BaseIntegration';
export default class DHLIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getRates(data: any): Promise<any>;
    createShipment(data: any): Promise<any>;
    getShipments(): Promise<any>;
    getShipment(shipmentId: string): Promise<any>;
    cancelShipment(shipmentId: string): Promise<any>;
    getTrackingInfo(shipmentId: string): Promise<any>;
}
//# sourceMappingURL=DHLIntegration.d.ts.map