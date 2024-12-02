import { stateset } from '../../stateset-client';

type WarrantyStatus = 'APPROVED' | 'CANCELLED' | 'CLOSED' | 'REOPENED' | 'REJECTED';

interface BaseWarrantyResponse {
  id: string;
  object: 'warranty';
  status: WarrantyStatus;
}

interface ApprovedWarrantyResponse extends BaseWarrantyResponse {
  status: 'APPROVED';
  approved: true;
}

interface RejectedWarrantyResponse extends BaseWarrantyResponse {
  status: 'REJECTED';
  rejected: true;
}

interface CancelledWarrantyResponse extends BaseWarrantyResponse {
  status: 'CANCELLED';
  cancelled: true;
}

interface ClosedWarrantyResponse extends BaseWarrantyResponse {
  status: 'CLOSED';
  closed: true;
}

interface ReopenedWarrantyResponse extends BaseWarrantyResponse {
  status: 'REOPENED';
  reopened: true;
}

type WarrantyResponse = ApprovedWarrantyResponse | RejectedWarrantyResponse | CancelledWarrantyResponse | ClosedWarrantyResponse | ReopenedWarrantyResponse;

interface ApiResponse {
  update_returns_by_pk: {
    id: string;
    status: WarrantyStatus;
    [key: string]: any;
  };
}

class Warranty {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): WarrantyResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_returns_by_pk) {
      throw new Error('Unexpected response format');
    }

    const warrantyData = response.update_returns_by_pk;

    const baseResponse: BaseWarrantyResponse = {
      id: warrantyData.id,
      object: 'warranty',
      status: warrantyData.status,
    };

    switch (warrantyData.status) {
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
        throw new Error(`Unexpected warranty status: ${warrantyData.status}`);
    }
  }

  /**
   * @returns Array of WarrantyResponse objects
   */
  async list() {
    return this.stateset.request('GET', 'warranties');
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns WarrantyResponse object
   */
  async get(warrantyId: string) {
    return this.stateset.request('GET', `warranties/${warrantyId}`);
  }

  /**
   * @param warrantyData - WarrantyData object
   * @returns WarrantyResponse object
   */
  async create(warrantyData: any) {
    return this.stateset.request('POST', 'warranties', warrantyData);
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns ApprovedWarrantyResponse object
   */
  async approve(warrantyId: string): Promise<ApprovedWarrantyResponse> {
    const response = await this.stateset.request('POST', `warranties/approve/${warrantyId}`);
    return this.handleCommandResponse(response) as ApprovedWarrantyResponse;
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns RejectedWarrantyResponse object
   */
  async reject(warrantyId: string): Promise<RejectedWarrantyResponse> {
    const response = await this.stateset.request('POST', `warranties/reject/${warrantyId}`);
    return this.handleCommandResponse(response) as RejectedWarrantyResponse;
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns CancelledWarrantyResponse object
   */
  async cancel(warrantyId: string): Promise<CancelledWarrantyResponse> {
    const response = await this.stateset.request('POST', `warranties/cancel/${warrantyId}`);
    return this.handleCommandResponse(response) as CancelledWarrantyResponse;
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns ClosedWarrantyResponse object
   */
  async close(warrantyId: string): Promise<ClosedWarrantyResponse> {
    const response = await this.stateset.request('POST', `warranties/close/${warrantyId}`);
    return this.handleCommandResponse(response) as ClosedWarrantyResponse;
  }

  /**
   * @param warrantyId - Warranty ID
   * @returns ReopenedWarrantyResponse object
   */
  async reopen(warrantyId: string): Promise<ReopenedWarrantyResponse> {
    const response = await this.stateset.request('POST', `warranties/reopen/${warrantyId}`);
    return this.handleCommandResponse(response) as ReopenedWarrantyResponse;
  }

  /**
   * @param warrantyId - Warranty ID
   * @param warrantyData - WarrantyData object
   * @returns WarrantyResponse object
   */
  async update(warrantyId: string, warrantyData: any) {
    return this.stateset.request('PUT', `warranties/${warrantyId}`, warrantyData);
  }

  /**
   * @param warrantyId - Warranty ID
   */
  async delete(warrantyId: string) {
    return this.stateset.request('DELETE', `warranties/${warrantyId}`);
  }
}

export default Warranty;