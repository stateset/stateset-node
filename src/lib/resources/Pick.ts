// lib/resources/Pick.ts

type PickStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BasePickResponse {
  id: string;
  object: 'pick';
  status: PickStatus;
}

interface PendingPickResponse extends BasePickResponse {
  status: 'PENDING';
  pending: true;
}

interface InProgressPickResponse extends BasePickResponse {
  status: 'IN_PROGRESS';
  inProgress: true;
}

interface CompletedPickResponse extends BasePickResponse {
  status: 'COMPLETED';
  completed: true;
}

interface CancelledPickResponse extends BasePickResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type PickResponse = PendingPickResponse | InProgressPickResponse | CompletedPickResponse | CancelledPickResponse;

interface ApiResponse {
  update_picks_by_pk: {
    id: string;
    status: PickStatus;
    [key: string]: any;
  };
}

interface PickData {
  order_id: string;
  items: {
    item_id: string;
    quantity: number;
    location: string;
  }[];
  [key: string]: any;
}

interface CompletionData {
  picked_items: {
    item_id: string;
    quantity_picked: number;
  }[];
}

interface OptimizedRoute {
  route: string[];
  estimated_time: number;
}

export default class Picks {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): PickResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_picks_by_pk) {
      throw new Error('Unexpected response format');
    }

    const pickData = response.update_picks_by_pk;

    const baseResponse: BasePickResponse = {
      id: pickData.id,
      object: 'pick',
      status: pickData.status,
    };

    switch (pickData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'IN_PROGRESS':
        return { ...baseResponse, status: 'IN_PROGRESS', inProgress: true };
      case 'COMPLETED':
        return { ...baseResponse, status: 'COMPLETED', completed: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected pick status: ${pickData.status}`);
    }
  }

  async create(data: PickData): Promise<PickResponse> {
    const response = await this.client.request('POST', 'picks', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<PickResponse> {
    const response = await this.client.request('GET', `picks/${id}`);
    return this.handleCommandResponse({ update_picks_by_pk: response });
  }

  async update(id: string, data: Partial<PickData>): Promise<PickResponse> {
    const response = await this.client.request('PUT', `picks/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<PickResponse[]> {
    const response = await this.client.request('GET', 'picks', params);
    return response.map((pick: any) => this.handleCommandResponse({ update_picks_by_pk: pick }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `picks/${id}`);
  }

  async complete(id: string, data: CompletionData): Promise<CompletedPickResponse> {
    const response = await this.client.request('POST', `picks/${id}/complete`, data);
    return this.handleCommandResponse(response) as CompletedPickResponse;
  }

  async optimizeRoute(id: string): Promise<OptimizedRoute> {
    return this.client.request('GET', `picks/${id}/optimize-route`);
  }

  async start(id: string): Promise<InProgressPickResponse> {
    const response = await this.client.request('POST', `picks/${id}/start`);
    return this.handleCommandResponse(response) as InProgressPickResponse;
  }

  async cancel(id: string): Promise<CancelledPickResponse> {
    const response = await this.client.request('POST', `picks/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledPickResponse;
  }

  async addItem(id: string, item: PickData['items'][0]): Promise<PickResponse> {
    const response = await this.client.request('POST', `picks/${id}/items`, item);
    return this.handleCommandResponse(response);
  }

  async removeItem(id: string, itemId: string): Promise<PickResponse> {
    const response = await this.client.request('DELETE', `picks/${id}/items/${itemId}`);
    return this.handleCommandResponse(response);
  }
}