import BaseIntegration from './BaseIntegration';

export default class KlaviyoIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.klaviyo.com');
  }

  public async getMarketingCampaigns() {
    return this.request('GET', 'marketing-campaigns');
  }

  public async getMarketingEvents() {
    return this.request('GET', 'marketing-events');
  }
  
}