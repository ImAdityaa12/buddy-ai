import { parseAsString, useQueryStates, parseAsInteger } from 'nuqs';
export const useAgentsFilters = () => {
    return useQueryStates({
        search: parseAsString
            .withDefault('')
            .withOptions({ clearOnDefault: true }),
        page: parseAsInteger
            .withDefault(1)
            .withOptions({ clearOnDefault: true }),
    });
};
