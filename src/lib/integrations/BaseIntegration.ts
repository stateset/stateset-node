// src/lib/integrations/BaseIntegration.ts
import fetch from 'node-fetch';

export default abstract class BaseIntegration {
  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  protected async request(method: string, path: string, data?: any) {
    const url = `${this.baseUrl}/${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in integration request:', error);
      throw error;
    }
  }
}
