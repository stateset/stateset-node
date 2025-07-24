// src/lib/integrations/BaseIntegration.ts
import axios from 'axios';

export default abstract class BaseIntegration {
  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  protected async request(method: string, path: string, data?: any) {
    const url = `${this.baseUrl}/${path}`;
    const response = await axios.request({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
}
