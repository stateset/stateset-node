import BaseIntegration from './BaseIntegration';
export default class KlaviyoIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getMarketingCampaigns(): Promise<any>;
    getMarketingEvents(): Promise<any>;
}
