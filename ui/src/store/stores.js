import {writable, derived} from 'svelte/store';

const createLocalStore = (key, startValue) => {
    const {subscribe, set, update} = writable(startValue);

    return {
        subscribe,
        set,
        update,
        useLocalStorage: () => {
            const json = localStorage.getItem(key);
            if (json && json !== 'undefined' && json !== 'null') {
                set(JSON.parse(json));
            } else if (json) {
                localStorage.removeItem(key);
            }

            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
    };
};

// If localStorage has the key then it will be used
// if not the default will be used. Format:
// export const var = createLocalStore(key, default)

export const sessionToken = createLocalStore('sessionToken', null);
export const refreshToken = createLocalStore('refreshToken', null);
export const expires = createLocalStore('expires', Date.now());
export const role = createLocalStore('role', null);
export const currentPage = createLocalStore('currentPage', 'login');
export const newUserAccount = createLocalStore('newUserAccount', null);
export const newAssociate = createLocalStore('newAssociate', null);
export const signature = createLocalStore('signature', {there_is_signature: false, data: ''});
export const medicalCertificate = createLocalStore('medicalCertificate', null);
export const paymentMethod = createLocalStore('paymentMethod', null);
export const newCourse = createLocalStore('newCourse', null);
export const userData = createLocalStore('userData', {});
export const subPage = createLocalStore('subPage', null);
export const isExpired = createLocalStore('isExpired', false);
export const billingData = createLocalStore('billingData', null);
export const permissions = createLocalStore('permissions', []);
export const tablesSettings = createLocalStore('tablesSettings', {});
export const selectedGroup = createLocalStore('selectedGroup', null);
export const sidebarCollapsed = writable(false);
export const preventBackHistoryUnsavedChanges = writable(false);

export const notifications = writable([]);
export const unreadNotificationsCounter = writable(0);
export const cartElements = writable([]);
// export const notifications = createLocalStore('notifications', []);
// export const unreadNotificationsCounter = createLocalStore('unreadNotificationsCounter', 0);

export const message = writable('CIAOOOOO');
export let secret = writable(0);

export const subscriptionListFilter = writable({
    generalSearch: '',
    status: '',
    year: '1',
    from_age: null,
    to_age: null,
    tags: [],
    tags_and: 0,
    filter: {
        hide_associate_and_members: false,
        hide_members: false,
        certificate_missing_flag: false,
        certificate_expired_flag: false,
        subscription_not_paid_flag: false,
        sort_lastname_asc_flag: false,
        sort_lastname_desc_flag: false,
    },
});

export const subscriptionListFilterDatatable = derived(subscriptionListFilter, $subscriptionListFilter => ({
    'query[current_year]': $subscriptionListFilter.year ?? '1',
    'query[status_flag]': $subscriptionListFilter.status ?? '',
    'query[generalSearch]': $subscriptionListFilter.generalSearch ?? '',
    'query[from_age]': $subscriptionListFilter.from_age ?? '',
    'query[to_age]': $subscriptionListFilter.to_age ?? '',
    'query[tags]': $subscriptionListFilter.tags ?? '',
    ...Object.keys($subscriptionListFilter.filter).reduce((acc, key) => ({
        ...acc,
        [`query[${key}]`]: $subscriptionListFilter.filter[key] ? 1 : 0
    }), {}),
    'query[tags_and]': $subscriptionListFilter.tags_and ?? 0,
    type: 'athletes',
    ...($subscriptionListFilter.prefix ? { 'query[prefix]': $subscriptionListFilter.prefix } : {}),
    ...($subscriptionListFilter.type_of_associate ? { 'query[type_of_associate]': $subscriptionListFilter.type_of_associate } : {}),
}));

export const associatesListFilter = writable({
    generalSearch: '',
    status: '',
    from_age: null,
    to_age: null,
    year: '1',
    filter: {
        hide_associate_and_members: false,
        expired_certificate: false,
        subscription_not_paid: false,
        sort_lastname_asc: false,
        sort_lastname_desc: false,
    },
});

export const associatesListFilterDatatable = derived(associatesListFilter, $associatesListFilter => ({
    'query[generalSearch]': $associatesListFilter.generalSearch ?? '',
    'query[status_flag]': $associatesListFilter.status ?? '',
    'query[current_year]': $associatesListFilter.year ?? '1',
    'query[from_age]': $associatesListFilter.from_age ?? '',
    'query[to_age]': $associatesListFilter.to_age ?? '',
    type: 'associates',
    ...Object.keys($associatesListFilter.filter).reduce((acc, key) => ({
        ...acc,
        [`query[${key}]`]: $associatesListFilter.filter[key] ? 1 : 0
    }), {}),
}));

export const personasListFilter = writable({
    is_tutor: '',
    generalSearch: '',
});

export const personasListFilterDatatable = derived(personasListFilter, $personasListFilter => ({
    'query[is_tutor]': $personasListFilter.is_tutor ?? '',
    'query[generalSearch]': $personasListFilter.generalSearch ?? '',
}));

export const personasPaymentListFilter = writable({
    generalSearch: '',
    associateId: null,
    type: '',
    paid: '',
    subject: '',
    expense: '',
});

export const personasPaymentListFilterDatatable = derived(personasPaymentListFilter, $personasPaymentListFilter => ({
    'query[generalSearch]': $personasPaymentListFilter.generalSearch ?? '',
    'associate_id': $personasPaymentListFilter.associateId ?? null,
    ...($personasPaymentListFilter.type !== '' && { 'query[type]': $personasPaymentListFilter.type }),
    ...($personasPaymentListFilter.paid !== '' && { 'query[paid]': $personasPaymentListFilter.paid }),
    ...($personasPaymentListFilter.subject !== '' && { 'query[subject]': $personasPaymentListFilter.subject }),
    ...($personasPaymentListFilter.expense !== '' && { 'query[expense]': $personasPaymentListFilter.expense }),
}));

export const templatesListFilter = writable({
    generalSearch: '',
});

export const templatesListFilterDatatable = derived(templatesListFilter, $templatesListFilter => ({
    'query[generalSearch]': $templatesListFilter.generalSearch ?? '',
}));



export const courseListFilter = writable({
    generalSearch: '',
    status_flag: '',
    tags: [],
    tags_and: 0
});

export const courseListFilterDatatable = derived(courseListFilter, $courseListFilter => ({
    'query[generalSearch]': $courseListFilter.generalSearch ?? '',
    'query[status_flag]': $courseListFilter.status_flag ?? '',
    'query[tags]': $courseListFilter.tags ?? '',
    'query[tags_and]': $courseListFilter.tags_and ?? 0,
}));