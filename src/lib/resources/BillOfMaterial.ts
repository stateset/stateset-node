import { stateset } from '../../stateset-client';

type BOMStatus = 'DRAFT' | 'ACTIVE' | 'OBSOLETE' | 'REVISION';

interface BaseBOMResponse {
  id: string;
  object: 'billofmaterials';
  status: BOMStatus;
}

interface DraftBOMResponse extends BaseBOMResponse {
  status: 'DRAFT';
  draft: true;
}

interface ActiveBOMResponse extends BaseBOMResponse {
  status: 'ACTIVE';
  active: true;
}

interface ObsoleteBOMResponse extends BaseBOMResponse {
  status: 'OBSOLETE';
  obsolete: true;
}

interface RevisionBOMResponse extends BaseBOMResponse {
  status: 'REVISION';
  revision: true;
}

type BOMResponse = DraftBOMResponse | ActiveBOMResponse | ObsoleteBOMResponse | RevisionBOMResponse;

interface ApiResponse {
  update_billofmaterials_by_pk: {
    id: string;
    status: BOMStatus;
    [key: string]: any;
  };
}

interface BOMData {
  name: string;
  description?: string;
  components: {
    item_id: string;
    quantity: number;
  }[];
  [key: string]: any;
}

class BillOfMaterials {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): BOMResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_billofmaterials_by_pk) {
      throw new Error('Unexpected response format');
    }

    const bomData = response.update_billofmaterials_by_pk;

    const baseResponse: BaseBOMResponse = {
      id: bomData.id,
      object: 'billofmaterials',
      status: bomData.status,
    };

    switch (bomData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'ACTIVE':
        return { ...baseResponse, status: 'ACTIVE', active: true };
      case 'OBSOLETE':
        return { ...baseResponse, status: 'OBSOLETE', obsolete: true };
      case 'REVISION':
        return { ...baseResponse, status: 'REVISION', revision: true };
      default:
        throw new Error(`Unexpected BOM status: ${bomData.status}`);
    }
  }

  async list(): Promise<BOMResponse[]> {
    const response = await this.stateset.request('GET', 'billofmaterials');
    return response.map((bom: any) => this.handleCommandResponse({ update_billofmaterials_by_pk: bom }));
  }

  async get(billOfMaterialId: string): Promise<BOMResponse> {
    const response = await this.stateset.request('GET', `billofmaterials/${billOfMaterialId}`);
    return this.handleCommandResponse({ update_billofmaterials_by_pk: response });
  }

  async create(billOfMaterialData: BOMData): Promise<BOMResponse> {
    const response = await this.stateset.request('POST', 'billofmaterials', billOfMaterialData);
    return this.handleCommandResponse(response);
  }

  async update(billOfMaterialId: string, billOfMaterialData: Partial<BOMData>): Promise<BOMResponse> {
    const response = await this.stateset.request('PUT', `billofmaterials/${billOfMaterialId}`, billOfMaterialData);
    return this.handleCommandResponse(response);
  }

  async delete(billOfMaterialId: string): Promise<void> {
    await this.stateset.request('DELETE', `billofmaterials/${billOfMaterialId}`);
  }

  async setActive(billOfMaterialId: string): Promise<ActiveBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${billOfMaterialId}/set-active`);
    return this.handleCommandResponse(response) as ActiveBOMResponse;
  }

  async setObsolete(billOfMaterialId: string): Promise<ObsoleteBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${billOfMaterialId}/set-obsolete`);
    return this.handleCommandResponse(response) as ObsoleteBOMResponse;
  }

  async startRevision(billOfMaterialId: string): Promise<RevisionBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${billOfMaterialId}/start-revision`);
    return this.handleCommandResponse(response) as RevisionBOMResponse;
  }

  async completeRevision(billOfMaterialId: string): Promise<ActiveBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${billOfMaterialId}/complete-revision`);
    return this.handleCommandResponse(response) as ActiveBOMResponse;
  }

  async addComponent(billOfMaterialId: string, componentData: { item_id: string; quantity: number }): Promise<BOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${billOfMaterialId}/add-component`, componentData);
    return this.handleCommandResponse(response);
  }

  async removeComponent(billOfMaterialId: string, componentId: string): Promise<BOMResponse> {
    const response = await this.stateset.request('DELETE', `billofmaterials/${billOfMaterialId}/components/${componentId}`);
    return this.handleCommandResponse(response);
  }
}

export default BillOfMaterials;