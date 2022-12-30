import URL from '../../urls';

const BASE = URL.accesses.pattern;

export default {
    accessList: BASE,

    newAccess: `${BASE}/new`,

    editAccess(id: number) {
        return `${BASE}/edit-access/${id}`;
    },
    EDIT_ACCESS_PATTERN: `${BASE}/edit-access/:accessId`,

    editAccount(id: number) {
        return `${BASE}/edit-account/${id}`;
    },
    EDIT_ACCOUNT_PATTERN: `${BASE}/edit-account/:accountId`,

    listAccountRecurringTransactions(id: number) {
        return `${BASE}/edit-account/${id}/recurring-transactions`;
    },
    LIST_ACCOUNT_RECURRING_TRANSACTIONS_PATTERN: `${BASE}/edit-account/:accountId/recurring-transactions`,

    newAccountRecurringTransaction(id: number) {
        return `${BASE}/edit-account/${id}/recurring-transactions/new`;
    },
    NEW_ACCOUNT_RECURRING_TRANSACTION_PATTERN: `${BASE}/edit-account/:accountId/recurring-transactions/new`,
};
