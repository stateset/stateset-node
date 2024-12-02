"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStateError = exports.JobValidationError = exports.JobNotFoundError = exports.JobPriority = exports.JobStatus = void 0;
// Enums and Types
var JobStatus;
(function (JobStatus) {
    JobStatus["PLANNED"] = "PLANNED";
    JobStatus["IN_PROGRESS"] = "IN_PROGRESS";
    JobStatus["COMPLETED"] = "COMPLETED";
    JobStatus["CANCELLED"] = "CANCELLED";
    JobStatus["ON_HOLD"] = "ON_HOLD";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
var JobPriority;
(function (JobPriority) {
    JobPriority["LOW"] = "LOW";
    JobPriority["MEDIUM"] = "MEDIUM";
    JobPriority["HIGH"] = "HIGH";
    JobPriority["URGENT"] = "URGENT";
})(JobPriority = exports.JobPriority || (exports.JobPriority = {}));
// Custom Error Classes
class JobNotFoundError extends Error {
    constructor(jobId) {
        super(`Production Job with ID ${jobId} not found`);
        this.name = 'JobNotFoundError';
    }
}
exports.JobNotFoundError = JobNotFoundError;
class JobValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'JobValidationError';
    }
}
exports.JobValidationError = JobValidationError;
class JobStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'JobStateError';
    }
}
exports.JobStateError = JobStateError;
// Main ProductionJob Class
class ProductionJob {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Validates job data
     */
    validateJobData(jobData) {
        if (jobData.quantity <= 0) {
            throw new JobValidationError('Production quantity must be greater than 0');
        }
        if (new Date(jobData.planned_end_date) <= new Date(jobData.planned_start_date)) {
            throw new JobValidationError('Planned end date must be after planned start date');
        }
        jobData.materials.forEach(material => {
            if (material.quantity_required <= 0) {
                throw new JobValidationError('Material quantity must be greater than 0');
            }
        });
    }
    /**
     * Processes API response into typed JobResponse
     */
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_productionjob_by_pk) {
            throw new Error('Unexpected response format');
        }
        const jobData = response.update_productionjob_by_pk;
        const baseResponse = {
            id: jobData.id,
            object: 'productionjob',
            created_at: jobData.created_at,
            updated_at: jobData.updated_at,
            status: jobData.status,
            data: jobData.data
        };
        switch (jobData.status) {
            case JobStatus.PLANNED:
                return { ...baseResponse, status: JobStatus.PLANNED, planned: true };
            case JobStatus.IN_PROGRESS:
                return { ...baseResponse, status: JobStatus.IN_PROGRESS, in_progress: true };
            case JobStatus.COMPLETED:
                return { ...baseResponse, status: JobStatus.COMPLETED, completed: true };
            case JobStatus.CANCELLED:
                return { ...baseResponse, status: JobStatus.CANCELLED, cancelled: true };
            case JobStatus.ON_HOLD:
                return { ...baseResponse, status: JobStatus.ON_HOLD, on_hold: true };
            default:
                throw new Error(`Unexpected job status: ${jobData.status}`);
        }
    }
    /**
     * List all production jobs with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.priority)
            queryParams.append('priority', params.priority);
        if (params === null || params === void 0 ? void 0 : params.bom_id)
            queryParams.append('bom_id', params.bom_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params === null || params === void 0 ? void 0 : params.start_after)
            queryParams.append('start_after', params.start_after.toISOString());
        if (params === null || params === void 0 ? void 0 : params.start_before)
            queryParams.append('start_before', params.start_before.toISOString());
        const response = await this.stateset.request('GET', `productionjob?${queryParams.toString()}`);
        return response.map((job) => this.handleCommandResponse({ update_productionjob_by_pk: job }));
    }
    /**
     * Get a specific production job by ID
     * @param jobId - Production job ID
     * @returns JobResponse object
     */
    async get(jobId) {
        try {
            const response = await this.stateset.request('GET', `productionjob/${jobId}`);
            return this.handleCommandResponse({ update_productionjob_by_pk: response });
        }
        catch (error) {
            if (error.status === 404) {
                throw new JobNotFoundError(jobId);
            }
            throw error;
        }
    }
    /**
     * Create a new production job
     * @param jobData - JobData object
     * @returns JobResponse object
     */
    async create(jobData) {
        this.validateJobData(jobData);
        const response = await this.stateset.request('POST', 'productionjob', jobData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update an existing production job
     * @param jobId - Production job ID
     * @param jobData - Partial<JobData> object
     * @returns JobResponse object
     */
    async update(jobId, jobData) {
        try {
            const response = await this.stateset.request('PUT', `productionjob/${jobId}`, jobData);
            return this.handleCommandResponse(response);
        }
        catch (error) {
            if (error.status === 404) {
                throw new JobNotFoundError(jobId);
            }
            throw error;
        }
    }
    /**
     * Delete a production job
     * @param jobId - Production job ID
     */
    async delete(jobId) {
        try {
            await this.stateset.request('DELETE', `productionjob/${jobId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new JobNotFoundError(jobId);
            }
            throw error;
        }
    }
    /**
     * Status management methods
     * @param jobId - Production job ID
     * @returns InProgressJobResponse object
     */
    async start(jobId) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/start`);
        return this.handleCommandResponse(response);
    }
    /**
     * Complete a production job
     * @param jobId - Production job ID
     * @param results - Results object
     * @returns CompletedJobResponse object
     */
    async complete(jobId, results) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/complete`, results);
        return this.handleCommandResponse(response);
    }
    /**
     * Cancel a production job
     * @param jobId - Production job ID
     * @param reason - Reason for cancellation
     * @returns CancelledJobResponse object
     */
    async cancel(jobId, reason) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/cancel`, { reason });
        return this.handleCommandResponse(response);
    }
    /**
     * Hold a production job
     * @param jobId - Production job ID
     * @param reason - Reason for holding
     * @returns OnHoldJobResponse object
     */
    async hold(jobId, reason) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/hold`, { reason });
        return this.handleCommandResponse(response);
    }
    /**
     * Resume a production job
     * @param jobId - Production job ID
     * @returns InProgressJobResponse object
     */
    async resume(jobId) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/resume`);
        return this.handleCommandResponse(response);
    }
    /**
     * Material management methods
     */
    async allocateMaterial(jobId, materialId, allocation) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/materials/${materialId}/allocate`, allocation);
        return this.handleCommandResponse(response);
    }
    /**
     * Record material usage
     */
    async recordMaterialUsage(jobId, materialId, usage) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/materials/${materialId}/usage`, usage);
        return this.handleCommandResponse(response);
    }
    /**
     * Quality management methods
     */
    async addQualityCheck(jobId, check) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/quality-checks`, check);
        return this.handleCommandResponse(response);
    }
    /**
     * Update a quality check
     */
    async updateQualityCheck(jobId, checkId, result) {
        const response = await this.stateset.request('PUT', `productionjob/${jobId}/quality-checks/${checkId}`, result);
        return this.handleCommandResponse(response);
    }
    /**
     * Progress tracking methods
     */
    async updateProgress(jobId, progress) {
        const response = await this.stateset.request('POST', `productionjob/${jobId}/progress`, progress);
        return this.handleCommandResponse(response);
    }
    /**
     * Report generation methods
     */
    async generateReport(jobId, type) {
        const response = await this.stateset.request('GET', `productionjob/${jobId}/report?type=${type}`);
        return response;
    }
}
exports.default = ProductionJob;
