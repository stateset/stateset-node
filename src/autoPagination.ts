import { AxiosPromise } from 'axios';

interface AutoPaginationMethods {
  autoPagingToArray: (opts: { limit: number }) => Promise<any[]>;
  autoPagingEach: (callback: (item: any) => boolean | Promise<boolean>) => Promise<void>;
}

export const makeAutoPaginationMethods = (
  stateset: any,
  methodArgs: any[],
  spec: any,
  requestPromise: AxiosPromise
): AutoPaginationMethods => {
  const autoPagingToArray = async (opts: { limit: number }): Promise<any[]> => {
    const limit = opts.limit;
    const results: any[] = [];
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

  const autoPagingEach = async (
    callback: (item: any) => boolean | Promise<boolean>
  ): Promise<void> => {
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
