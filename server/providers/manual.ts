// This modules implements a manual access where the user fills the transactions themselves.

import { accountTypeNameToId } from '../lib/account-types';
import { translate as $t } from '../helpers';
import { Provider, ProviderAccount, ProviderTransaction } from '.';

export const SOURCE_NAME = 'manual';

export const fetchAccounts = async (): Promise<ProviderAccount[]> => {
    const manualAccountLabel = $t('server.banks.manual_account');
    const unknownTypeId = accountTypeNameToId('account-type.unknown');
    return [
        {
            vendorAccountId: '1',
            label: `${manualAccountLabel} #1 (EUR)`,
            balance: '0',
            currency: 'EUR',
            type: unknownTypeId,
        },
        {
            vendorAccountId: '2',
            label: `${manualAccountLabel} #2 (EUR)`,
            balance: '0',
            currency: 'EUR',
            type: unknownTypeId,
        },
        {
            vendorAccountId: '3',
            label: `${manualAccountLabel} #3 (USD)`,
            balance: '0',
            currency: 'USD',
            type: unknownTypeId,
        },
    ];
};

export const fetchOperations = (): Promise<ProviderTransaction[]> => {
    return Promise.resolve([]);
};

export const _: Provider = {
    SOURCE_NAME,
    fetchAccounts,
    fetchOperations,
};
