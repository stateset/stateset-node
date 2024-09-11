import { stateset } from '../../stateset-client';

type ReturnStatus = 'APPROVED' | 'CANCELLED' | 'CLOSED' | 'REOPENED' | 'REJECTED';

interface BaseReturnResponse {
  id: string;
  object: 'return';
  status: ReturnStatus;
}

interface ApprovedReturnResponse extends BaseReturnResponse {
  status: 'APPROVED';
  approved: true;
}

interface RejectedReturnResponse extends BaseReturnResponse {
  status: 'REJECTED';
  rejected: true;
}

interface CancelledReturnResponse extends BaseReturnResponse {
  status: 'CANCELLED';
  cancelled: true;
}

interface ClosedReturnResponse extends BaseReturnResponse {
  status: 'CLOSED';
  closed: true;
}

interface ReopenedReturnResponse extends BaseReturnResponse {
  status: 'REOPENED';
  reopened: true;
}

type ReturnResponse = ApprovedReturnResponse | RejectedReturnResponse | CancelledReturnResponse | ClosedReturnResponse | ReopenedReturnResponse;

interface ApiResponse {
  update_returns_by_pk: {
    id: string;
    status: ReturnStatus;
    [key: string]: any;
  };
}

class Returns {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): ReturnResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_returns_by_pk) {
      throw new Error('Unexpected response format');
    }

    const returnData = response.update_returns_by_pk;

    const baseResponse: BaseReturnResponse = {
      id: returnData.id,
      object: 'return',
      status: returnData.status,
    };

    switch (returnData.status) {
      case 'APPROVED':
        return { ...baseResponse, status: 'APPROVED', approved: true };
      case 'REJECTED':
        return { ...baseResponse, status: 'REJECTED', rejected: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      case 'CLOSED':
        return { ...baseResponse, status: 'CLOSED', closed: true };
      case 'REOPENED':
        return { ...baseResponse, status: 'REOPENED', reopened: true };
      default:
        throw new Error(`Unexpected return status: ${returnData.status}`);
    }
  }

  async list() {
    return this.stateset.request('GET', 'returns');
  }

  async get(returnId: string) {
    return this.stateset.request('GET', `returns/${returnId}`);
  }

  async create(returnData: any) {
    return this.stateset.request('POST', 'returns', returnData);
  }

  async approve(returnId: string): Promise<ApprovedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/approve/${returnId}`);
    return this.handleCommandResponse(response) as ApprovedReturnResponse;
  }

  async reject(returnId: string): Promise<RejectedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/reject/${returnId}`);
    return this.handleCommandResponse(response) as RejectedReturnResponse;
  }

  async cancel(returnId: string): Promise<CancelledReturnResponse> {
    const response = await this.stateset.request('POST', `returns/cancel/${returnId}`);
    return this.handleCommandResponse(response) as CancelledReturnResponse;
  }

  async close(returnId: string): Promise<ClosedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/close/${returnId}`);
    return this.handleCommandResponse(response) as ClosedReturnResponse;
  }

  async reopen(returnId: string): Promise<ReopenedReturnResponse> {
    const response = await this.stateset.request('POST', `returns/reopen/${returnId}`);
    return this.handleCommandResponse(response) as ReopenedReturnResponse;
  }

  async update(returnId: string, returnData: any) {
    return this.stateset.request('PUT', `returns/${returnId}`, returnData);
  }

  async delete(returnId: string) {
    return this.stateset.request('DELETE', `returns/${returnId}`);
  }
}

export default Returns;