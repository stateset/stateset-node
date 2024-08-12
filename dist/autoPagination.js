"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAutoPaginationMethods = void 0;
const makeAutoPaginationMethods = (stateset, methodArgs, spec, requestPromise) => {
    const autoPagingToArray = async (opts) => {
        const limit = opts.limit;
        const results = [];
        let hasMore = true;
        let page = 1;
        while (hasMore && results.length < limit) {
            const response = await requestPromise;
            results.push(...response.data.data);
            hasMore = response.data.has_more;
            page++;
            if (hasMore) {
                requestPromise = stateset[spec.method](...methodArgs, { page });
            }
        }
        return results.slice(0, limit);
    };
    const autoPagingEach = async (callback) => {
        let hasMore = true;
        let page = 1;
        while (hasMore) {
            const response = await requestPromise;
            for (const item of response.data.data) {
                const shouldContinue = await callback(item);
                if (shouldContinue === false) {
                    return;
                }
            }
            hasMore = response.data.has_more;
            page++;
            if (hasMore) {
                requestPromise = stateset[spec.method](...methodArgs, { page });
            }
        }
    };
    return {
        autoPagingToArray,
        autoPagingEach,
    };
};
exports.makeAutoPaginationMethods = makeAutoPaginationMethods;
