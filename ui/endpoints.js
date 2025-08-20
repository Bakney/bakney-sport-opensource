export const buildConfig = function(config={
        DEPLOY_ENV: "development",
        versionUI: "0.0.0",
        releaseNotesUI: "0.0.0",
        apiHost: "/api",
        domain: "https://localhost:5001",
    }, oemConfig={}) {

    const DEPLOY_ENV = config.DEPLOY_ENV;
    const versionUI = config.versionUI;
    const releaseNotesUI = config.releaseNotesUI;
    const apiHost = config.apiHost;
    const domain = config.domain;

    return {
        __bakney: JSON.stringify({
            OEM_CONFIG: oemConfig,
            IS_BETA: false,
            STRIPE_PRICING_TABLE: (DEPLOY_ENV == 'development' || DEPLOY_ENV == 'staging')
                ? "<test_pricing_table>"
                : (oemConfig?.stripe?.pricingTable || "<live_pricing_table>"),
            STRIPE_KEY: (DEPLOY_ENV == 'development' || DEPLOY_ENV == 'staging')
                        ? '<test_key>'
                        : (oemConfig?.stripe?.publicKey || '<live_key>'),
            STRIPE_CLIENT_PORTAL: (DEPLOY_ENV == 'development' || DEPLOY_ENV == 'staging')
                ? "<test_client_portal>"
                : (oemConfig?.stripe?.clientPortal || "<live_client_portal>"),
            env: {
                HOST: apiHost,
                DOMAIN: domain,
                DEV: DEPLOY_ENV == 'development',
                DEPLOY_ENV: DEPLOY_ENV,
                DEBUG: false,
                API: {
                    EXPORT_ALL_DATA: `${apiHost}/export-all-data`,
                    HEALTH: `${apiHost}/health`,
                    SPORT_ASSOCIATIONS: `${apiHost}/sport-associations/list`,
                    SPORT_ASSOCIATIONS_ADMIN_UPDATE: `${apiHost}/sport-associations/<uid>/admin-update`,
                    CHECK_INCONSISTENCIES: `${apiHost}/check-inconsistencies`,
                    GOOGLE: {
                        CHECK: `${apiHost}/google/check`,
                        CALENDAR_CONFIG: `${apiHost}/google/calendar/config`,
                        CALENDAR_COURSE_SYNC: `${apiHost}/google/calendar/<uid>/export`,
                    },
                    FOLDERS: {
                        LIST: `${apiHost}/folders/list`,
                        ADD: `${apiHost}/folders/add`,
                        DELETE: `${apiHost}/folders/<uid>/delete`,
                        UPDATE: `${apiHost}/folders/<uid>/update`,
                        MOVE: `${apiHost}/folders/<uid>/move`,
                    },
                    DOCUMENTS: {
                        LIST: `${apiHost}/documents/list`,
                        ADD: `${apiHost}/documents/add`,
                        DELETE: `${apiHost}/documents/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/documents/bulk-delete`,
                        UPDATE: `${apiHost}/documents/<uid>/update`,
                        MOVE: `${apiHost}/documents/<uid>/move`,
                    },
                    TEMPLATES: {
                        LIST: `${apiHost}/templates/list`,
                        ADD: `${apiHost}/templates/add`,
                        DELETE: `${apiHost}/templates/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/templates/bulk-delete`,
                        UPDATE: `${apiHost}/templates/<uid>/update`,
                    },
                    ONBOARDING: {
                        UPDATE: `${apiHost}/onboarding/update`,
                    },
                    COMMUNICATIONS: {
                        SETTINGS: {
                            SMTP: {
                                UPDATE: `${apiHost}/communications/settings/smtp/update`,
                                INFO: `${apiHost}/communications/settings/smtp/info`,
                                VERIFY: `${apiHost}/communications/settings/smtp/verify`,
                            }
                        },
                        SEND: {
                            SMS: `${apiHost}/communications/send/sms`,
                            EMAIL: `${apiHost}/communications/send/email`,
                            POST: `${apiHost}/communications/send/post`,
                        },
                        BUY: {
                            SMS: `${apiHost}/communications/buy/sms`,
                        },
                        HISTORY: {
                            SMS: `${apiHost}/communications/history/sms`,
                        },
                        AUTOMATION: {
                            LIST: `${apiHost}/communications/automation/list`,
                            ADD: `${apiHost}/communications/automation/add`,
                            DELETE: `${apiHost}/communications/automation/<uid>/delete`,
                            UPDATE: `${apiHost}/communications/automation/<uid>/update`,
                        },
                        MESSAGES: {
                            LIST: `${apiHost}/communications/messages/list`,
                            ADD: `${apiHost}/communications/messages/add`,
                            DELETE: `${apiHost}/communications/messages/<uid>/delete`,
                            DETAILS: `${apiHost}/communications/messages/<uid>/details`,
                        },
                        WORKFLOWS: {
                            LIST: `${apiHost}/communications/workflows/list`,
                            ADD: `${apiHost}/communications/workflows/add`,
                            DELETE: `${apiHost}/communications/workflows/<uid>/delete`,
                            UPDATE: `${apiHost}/communications/workflows/<uid>/update`,
                            DETAILS: `${apiHost}/communications/workflows/<uid>/details`,
                        },
                        EMAIL_LOGS: {
                            LIST: `${apiHost}/communications/email-logs/list`,
                        }
                    },
                    NOTIFICATION: {
                        ALL: `${apiHost}/notifications/all/`
                    },
                    STATISTIC: {
                        DASHBOARD: `${apiHost}/statistic/dashboard`,
                        DASHBOARD_LAYOUT: `${apiHost}/statistic/dashboard/layout`,
                        REPORT: `${apiHost}/statistic/report`,
                        ATHLETE_DASHBOARD: `${apiHost}/statistic/athlete-dashboard`,
                    },
                    SEARCH: {
                        ALL: `${apiHost}/search/all`,
                        PROFILE: `${apiHost}/search/profile`
                    },
                    CALENDAR:{
                        EVENTS: `${apiHost}/calendar/events`,
                        UPDATE : `${apiHost}/calendar/events/update`,
                        EXPORT: `${apiHost}/calendar/events/export`,
                    },
                    SUBSCRIPTION: {
                        MEMBERSHIPS: {
                            LIST: `${apiHost}/subscription/memberships/list`,
                            ADD: `${apiHost}/subscription/memberships/add`,
                            DELETE: `${apiHost}/subscription/memberships/<uid>/delete`,
                            UPDATE: `${apiHost}/subscription/memberships/<uid>/update`,
                        },
                        TAGS: {
                            LIST: `${apiHost}/subscription/tags/list`,
                            ADD: `${apiHost}/subscription/tags/add`,
                            UPDATE: `${apiHost}/subscription/tags/<uid>/update`,
                            DELETE: `${apiHost}/subscription/tags/<uid>/delete`,
                            ASSIGN: `${apiHost}/subscription/tags/<uid>/assign/<sub_uid>`,
                            UNASSIGN: `${apiHost}/subscription/tags/<uid>/unassign/<sub_uid>`,
                        },
                        CARD: `${apiHost}/subscription/<uid>/card`,
                        CALCULATE_TAX_CODE: `${apiHost}/subscription/calculate-tax-code`,
                        APPROVE: `${apiHost}/subscription/<uid>/approve`,
                        REJECT: `${apiHost}/subscription/<uid>/reject`,
                        INFO: `${apiHost}/subscription/<uid>/info`,
                        PAYMENTS: `${apiHost}/subscription/<uid>/payments`,
                        ATTENDANCE: `${apiHost}/subscription/<uid>/attendance`,
                        CALENDAR: `${apiHost}/subscription/<uid>/calendar`,
                        ADD: `${apiHost}/subscription/add`,
                        RENEW: `${apiHost}/subscription/renew`,
                        LIST: `${apiHost}/subscription/list`,
                        LIST_ALL: `${apiHost}/subscription/list/all`,
                        EXPORT: `${apiHost}/subscription/list/export`,
                        SIGN: `${apiHost}/subscription/sign`,
                        DELETE: `${apiHost}/subscription/<uid>/delete`,
                        EDIT: `${apiHost}/subscription/<uid>/edit`,
                        ARCHIVE: `${apiHost}/subscription/<uid>/archive`,
                        UPDATE: `${apiHost}/subscription/<uid>/update`,
                        UPLOAD_DOCUMENT: `${apiHost}/subscription/<uid>/upload-document`,
                        DELETE_DOCUMENT: `${apiHost}/subscription/<uid>/delete-document/<doc_uid>`,
                        MEDICAL_CERTIFICATE: {
                            UPLOAD: `${apiHost}/subscription/<uid>/medical-certificate/upload`,
                            EDIT: `${apiHost}/subscription/<uid>/medical-certificate/edit`,
                            SET_CERTIFICATE_EXPIRATION: `${apiHost}/subscription/<uid>/medical-certificate/set-certificate-expiration`,
                            SEND_EMAIL_REMINDER: `${apiHost}/subscription/<uid>/medical-certificate/send-email-reminder`,
                        },
                        MEDICAL_APPOINTMENTS: {
                            LIST: `${apiHost}/subscription/<uid>/medical-appointments/list`,
                            ADD: `${apiHost}/subscription/<uid>/medical-appointments/add`,
                            DELETE: `${apiHost}/subscription/<uid>/medical-appointments/<med_app_uid>/delete`,
                        },
                        IMPORT: {
                            UPLOAD: `${apiHost}/subscription/import/upload`,
                            STATUS: `${apiHost}/subscription/import/status`
                        },
                        ASSOCIATES_DRAFT: {
                            ADD: `${apiHost}/subscription/associates-draft/add`,
                            LIST: `${apiHost}/subscription/associates-draft/list`,
                            APPROVE: `${apiHost}/subscription/associates-draft/list/approve`,
                            EDIT: `${apiHost}/subscription/associates-draft/<uid>/edit`,
                            DELETE: `${apiHost}/subscription/associates-draft/<uid>/delete`,
                            BULK_DELETE: `${apiHost}/subscription/associates-draft/bulk-delete`,
                        },
                        TRANSFER: {
                            TRANSFER: `${apiHost}/subscription/<uid>/transfer`,
                            LIST: `${apiHost}/subscription/transfer/list`,
                            ACCEPT: `${apiHost}/subscription/<uid>/transfer/<transfer_uid>/accept`,
                            EXPIRE: `${apiHost}/subscription/<uid>/transfer/<transfer_uid>/expire`,
                            REJECT: `${apiHost}/subscription/<uid>/transfer/<transfer_uid>/reject`,
                        }
                    },
                    ATTENDANCE: {
                        MARK: `${apiHost}/attendance/<uid>/mark`,
                    },
                    ATTENDANCE_DAY: {
                        DELETE: `${apiHost}/attendance-day/<uid>/delete`,
                        MARK_ABSENT: `${apiHost}/attendance-day/<uid>/mark-absent`,
                    },
                    COURSE_SUBSCRIPTIONS: {
                        LIST: `${apiHost}/course-subscriptions/list`,
                        DELETE: `${apiHost}/course-subscriptions/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/course-subscriptions/bulk-delete`,
                        UPDATE: `${apiHost}/course-subscriptions/<uid>/update`,
                        ADD: `${apiHost}/course-subscriptions/add`,
                    },
                    COURSE: {
                        PIN: `${apiHost}/course/<uid>/pin`,
                        TAGS: {
                            LIST: `${apiHost}/course/tags/list`,
                            ADD: `${apiHost}/course/tags/add`,
                            DELETE: `${apiHost}/course/tags/<uid>/delete`,
                            ASSIGN: `${apiHost}/course/tags/<uid>/assign/<course_uid>`,
                            UNASSIGN: `${apiHost}/course/tags/<uid>/unassign/<course_uid>`,
                        },
                        LIST: `${apiHost}/course/list`,
                        ADD: `${apiHost}/course/add`,
                        OVERVIEW: `${apiHost}/course/<uid>/overview`,
                        OVERVIEW_ADD: `${apiHost}/course/<uid>/overview/<sub_uid>/add`,
                        CALENDAR: `${apiHost}/course/<uid>/calendar`,
                        CALENDAR_UPDATE: `${apiHost}/course/<uid>/calendar/update`,
                        ATTENDEES: `${apiHost}/course/<uid>/attendees`,
                        ATTENDEES_UPDATE: `${apiHost}/course/<uid>/attendees/<att_uid>/update`,
                        UPDATE: `${apiHost}/course/<uid>/update`,
                        SUBSCRIPTION: {
                            LIST: `${apiHost}/course/<uid>/overview/list`,
                            DELETE: `${apiHost}/course/<uid>/overview/<sub_uid>/delete`,
                            ADD: `${apiHost}/course/<uid>/overview/add`,
                            UPDATE: `${apiHost}/course/<uid>/overview/<sub_uid>/update`,
                        },
                        LOCATIONS: {
                            ADD: `${apiHost}/course/locations/add`,
                            DELETE: `${apiHost}/course/locations/<uid>/delete`,
                            UPDATE: `${apiHost}/course/locations/<uid>/update`,
                            LIST: `${apiHost}/course/locations/list`,

                        }
                    },
                    COURSE_INSTALLMENT: {
                        MAKE_PAYMENT: `${apiHost}/course-installment/<uid>/make-payment`,
                    },
                    CAMPS_AND_RETREATS: {
                        LIST: `${apiHost}/camps-and-retreats/list`,
                        ADD: `${apiHost}/camps-and-retreats/add`,
                        UPDATE: `${apiHost}/camps-and-retreats/<uid>/update`,
                        DELETE: `${apiHost}/camps-and-retreats/<uid>/delete`,
                        INFO: `${apiHost}/camps-and-retreats/<uid>/info`,
                        SUBSCRIPTIONS: {
                            LIST: `${apiHost}/camps-and-retreats/<uid>/subscriptions/list`,
                            ADD: `${apiHost}/camps-and-retreats/<uid>/subscriptions/add`,
                            UPDATE: `${apiHost}/camps-and-retreats/<uid>/subscriptions/update`,
                            DELETE: `${apiHost}/camps-and-retreats/<uid>/subscriptions/delete`,
                        },
                        PERIODS: {
                            INFO: `${apiHost}/camps-and-retreats/periods/<uid>/info`,
                            ADD: `${apiHost}/camps-and-retreats/periods/add`,
                            UPDATE: `${apiHost}/camps-and-retreats/periods/<uid>/update`,
                            DELETE: `${apiHost}/camps-and-retreats/periods/<uid>/delete`,
                            SERVICES: {
                                ADD: `${apiHost}/camps-and-retreats/periods/services/add`,
                                UPDATE: `${apiHost}/camps-and-retreats/periods/services/<uid>/update`,
                                DELETE: `${apiHost}/camps-and-retreats/periods/services/<uid>/delete`,
                            }
                        }
                    },
                    EVENT: {
                        LIST: `${apiHost}/event/list`,
                        ADD: `${apiHost}/event/add`,
                        DELETE: `${apiHost}/event/<uid>/delete`,
                        UPDATE: `${apiHost}/event/<uid>/update`,
                        SUBSCRIPTION: {
                            LIST: `${apiHost}/event/<uid>/subscriptions/list`,
                            ADD: `${apiHost}/event/<uid>/subscriptions/add`,
                            DELETE: `${apiHost}/event/<uid>/subscriptions/<sub_uid>/delete`,
                        }
                    },
                    MODULES: {
                        LIST: `${apiHost}/modules/list`,
                        ADD: `${apiHost}/modules/add`,
                        DELETE: `${apiHost}/modules/<uid>/delete`,
                        UPDATE: `${apiHost}/modules/<uid>/update`,
                        CHECK_LINK: `${apiHost}/modules/check-link`,
                        CUSTOM_LINK_INFO: `${apiHost}/modules/<uid>/info`,
                        OVERVIEW: `${apiHost}/modules/<uid>/overview`,
                        EXPORT: `${apiHost}/modules/<uid>/export`,
                        RESPONSE: {
                            LIST: `${apiHost}/modules/<uid>/response/list`,
                            ADD: `${apiHost}/modules/<uid>/response/add`,
                            DELETE: `${apiHost}/modules/response/<uid>/delete`,
                            APPROVE: `${apiHost}/modules/response/<uid>/approve`,
                            ADD_ATTACHMENT: `${apiHost}/modules/response/<uid>/add-attachment`,
                        }
                    },
                    CARNET: {
                        INFO: `${apiHost}/carnet/<uid>/info`,
                        ADD: `${apiHost}/carnet/add`,
                        LIST: `${apiHost}/carnet/list`,
                        DELETE: `${apiHost}/carnet/<uid>/delete`,
                        UPDATE: `${apiHost}/carnet/<uid>/update`,
                        ASSIGN: `${apiHost}/carnet/<uid>/assign/<sub_uid>`,
                        REPLACE: `${apiHost}/carnet/<uid>/replace/<sub_uid>`,
                        UNASSIGN: `${apiHost}/carnet/<uid>/unassign/<sub_uid>`,
                    },
                    CARNET_SUBSCRIPTION: {
                        LIST: `${apiHost}/carnet-subscription/list`,
                        UPDATE: `${apiHost}/carnet-subscription/<uid>/update`,
                        ENABLE: `${apiHost}/carnet-subscription/<uid>/enable`,
                        DISABLE: `${apiHost}/carnet-subscription/<uid>/disable`,
                        DELETE: `${apiHost}/carnet-subscription/<uid>/delete/<sub_uid>`,
                        TOP_UP:  `${apiHost}/carnet-subscription/<uid>/topup`,
                    },
                    SUPPLIER: {
                        LIST: `${apiHost}/supplier/list`,
                        INFO: `${apiHost}/supplier/<uid>/info`,
                        ADD: `${apiHost}/supplier/add`,
                        UPDATE: `${apiHost}/supplier/<uid>/update`,
                        DELETE: `${apiHost}/supplier/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/supplier/bulk-delete`,
                    },
                    INSTRUCTOR: {
                        REPORT: `${apiHost}/instructor/report`,
                        INFO: `${apiHost}/instructor/<uid>/info`,
                        LIST: `${apiHost}/instructor/list`,
                        ADD: `${apiHost}/instructor/add`,
                        DELETE: `${apiHost}/instructor/<uid>/delete`,
                        UPDATE: `${apiHost}/instructor/<uid>/update`,
                        HOURS: {
                            LIST: `${apiHost}/instructor/<uid>/hours/list`,
                            CALCULATE: `${apiHost}/instructor/<uid>/hours/calculate`,
                            ADD: `${apiHost}/instructor/<uid>/hours/add`,
                            UPDATE: `${apiHost}/instructor/<uid>/hours/<hour_uid>/update`,
                            DELETE: `${apiHost}/instructor/<uid>/hours/<hour_uid>/delete`,
                            ADD_COMPENSATION: `${apiHost}/instructor/<uid>/hours/add/compensation`,
                        }
                    },
                    PRINTING: {
                        GENERATE: `${apiHost}/printing/generate`,
                    },
                    PAYMENT: {
                        INFO: `${apiHost}/payment/<uid>/info`,
                        STATS: `${apiHost}/payment/stats`,
                        LIST: `${apiHost}/payment/list`,
                        ADD: `${apiHost}/payment/add`,
                        APPROVE: `${apiHost}/payment/<uid>/approve`,
                        CANCEL: `${apiHost}/payment/<uid>/cancel`,
                        UPDATE: `${apiHost}/payment/<uid>/update`,
                        DELETE: `${apiHost}/payment/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/payment-bulk/delete`,
                        EXPORT: `${apiHost}/payment/list/export`,
                        SIGN: `${apiHost}/payment/sign`,
                        GENERATE_INVOICE: `${apiHost}/payment/<uid>/generate-invoice`,
                        REQUEST: `${apiHost}/payment/<uid>/request`,
                        ARCHIVE: `${apiHost}/payment/<uid>/archive`,
                        BULK_ARCHIVE: `${apiHost}/payment-bulk/archive`,
                        CATEGORY: {
                            LIST: `${apiHost}/payment/category/list`,
                            ADD: `${apiHost}/payment/category/add`,
                            UPDATE: `${apiHost}/payment/category/<uid>/update`,
                            DELETE: `${apiHost}/payment/category/<uid>/delete`,
                        },
                        SIMULATION: {
                            PARTIAL_QUOTES: `${apiHost}/payment/simulation/partial-quotes`,
                            PARTIAL_QUOTES_APPLY: `${apiHost}/payment/simulation/partial-quotes-apply`,
                        }
                    },
                    INVOICE: {
                        LIST: `${apiHost}/invoice/list`,
                        UPDATE: `${apiHost}/invoice/<uid>/update`,
                        EXPORT: `${apiHost}/invoice/list/export`,
                        DELETE: `${apiHost}/invoice/<uid>/delete`,
                        BULK_DELETE: `${apiHost}/invoice-bulk/delete`,
                        BULK_ARCHIVE: `${apiHost}/invoice-bulk/archive`,
                        SEND: `${apiHost}/invoice/<uid>/send`,
                    },
                    INVOICE_SUPPLIERS: {
                        STATS: `${apiHost}/invoice-suppliers/stats`,
                        LIST: `${apiHost}/invoice-suppliers/list`,
                        ADD: `${apiHost}/invoice-suppliers/add`,
                        UPDATE: `${apiHost}/invoice-suppliers/<uid>/update`,
                        EXPORT: `${apiHost}/invoice-suppliers/list/export`,
                        DELETE: `${apiHost}/invoice-suppliers/<uid>/delete`,
                    },
                    INVOICE_CUSTOMERS: {
                        STATS: `${apiHost}/invoice-customers/stats`,
                        LIST: `${apiHost}/invoice-customers/list`,
                        ADD: `${apiHost}/invoice-customers/add`,
                        UPDATE: `${apiHost}/invoice-customers/<uid>/update`,
                        DELETE: `${apiHost}/invoice-customers/<uid>/delete`,
                    },
                    BALANCE_SHEET: `${apiHost}/balance-sheet`,
                    BALANCE_SHEET_ACCOUNTS: {
                        LIST: `${apiHost}/balance-sheet/accounts/list`,
                        ADD: `${apiHost}/balance-sheet/accounts/add`,
                        UPDATE: `${apiHost}/balance-sheet/accounts/<uid>/update`,
                        DELETE: `${apiHost}/balance-sheet/accounts/<uid>/delete`,
                    },
                    BALANCE_SHEET_ACCOUNTS_TRANSFER: {
                        LIST: `${apiHost}/balance-sheet/accounts-transfer/list`,
                        ADD: `${apiHost}/balance-sheet/accounts-transfer/add`,
                        UPDATE: `${apiHost}/balance-sheet/accounts-transfer/<uid>/update`,
                        DELETE: `${apiHost}/balance-sheet/accounts-transfer/<uid>/delete`,
                    },
                    DOCUMENT: {
                        RETRIEVE: `${apiHost}/document/retrieve`,
                        DELETE: `${apiHost}/document/<uid>/delete`,
                        SUBSCRIPTION: `${apiHost}/document/subscription`,
                        TEMPLATE: `${apiHost}/document/template/<uid>`,
                    },
                    PROFILE: {
                        ASSOCIATES: `${apiHost}/profile/associates`,
                        ASSOCIATES_COURSE: `${apiHost}/profile/associates/course`,
                        ASSOCIATES_DISABLE: `${apiHost}/profile/associates/<uid>/disable`,
                        ASSOCIATES_SPORT_ASSOCIATION: `${apiHost}/profile/associates/sport-association`,
                        SETTINGS: `${apiHost}/profile/settings`,
                        INTEGRATIONS: `${apiHost}/profile/integrations`,
                        TABLES: `${apiHost}/profile/settings/tables`,
                        INFO: `${apiHost}/profile/info`,
                        BILLING_INVOICE: {
                            LIST: `${apiHost}/profile/billing-invoice/list`,
                            UPLOAD: `${apiHost}/document/billing-invoice/`,
                        }
                    },
                    PERSONAS: {
                        ADD: `${apiHost}/personas/add`,
                        LIST: `${apiHost}/personas/list`,
                        ALL_TUTORS: `${apiHost}/personas/all-tutors`,
                        BULK_DELETE: `${apiHost}/personas/bulk-delete`,
                        DELETE: `${apiHost}/personas/<uid>/delete`,
                        UPDATE: `${apiHost}/personas/<uid>/update`,
                        INFO: `${apiHost}/personas/<uid>/info`,
                        ALL: `${apiHost}/personas/all`,
                        RECOVER: `${apiHost}/personas/<uid>/recover`,
                    },
                    PERSONAS_SUBSCRIPTIONS: {
                        LIST: `${apiHost}/personas-subscriptions/<uid>/list`,
                    },
                    SIGNATURE: {
                        CONVERT: `${apiHost}/signature/convert/picture`,
                    },
                    TICKET: {
                        CREATE: `${apiHost}/ticket/add`,
                        RETRIEVE: `${apiHost}/ticket/list`,
                        STATUS: `${apiHost}/ticket/status`,
                    },
                    TWO_FACTORS: {
                        INFO: `${apiHost}/two-fa/info`,
                        SETUP: `${apiHost}/two-fa/setup`,
                        UPDATE: `${apiHost}/two-fa/update`
                    },
                    STRIPE: {
                        INFO: `${apiHost}/stripe/info`,
                        ON_BOARDING: `${apiHost}/stripe/on-boarding`,
                        COMPLETE_ON_BOARDING: `${apiHost}/stripe/complete-on-boarding`,
                        PAY: `${apiHost}/stripe/pay/<uid>`,
                        MULTIPLE_PAY: `${apiHost}/stripe/multiple-pay`,
                    },
                    TESTIMONIALS: {
                        ADD: `${apiHost}/testimonials/add`,
                    },
                    COLLABORATORS: {
                        LIST: `${apiHost}/collaborators/list`,
                        ADD: `${apiHost}/collaborators/add`,
                        UPDATE: `${apiHost}/collaborators/<uid>/update`,
                        DELETE: `${apiHost}/collaborators/<uid>/delete`,
                    },
                    BILLING: {
                        ACTIVE_PLAN: `${apiHost}/billing/active-plan`,
                        CHECKOUT: `${apiHost}/billing/checkout`,
                        CANCEL_PLAN: `${apiHost}/billing/cancel-plan`,
                    },
                    OAUTH2: {
                        LOGIN: `${apiHost}/oauth2/login`,
                        SIGNUP: `${apiHost}/oauth2/signup`,
                        LOGOUT: `${apiHost}/oauth2/logout`,
                        RESET: `${apiHost}/oauth2/reset`,
                        REFRESH_TOKEN: `${apiHost}/oauth2/refresh-token`,
                        PARTIAL_SIGNUP: `${apiHost}/oauth2/partial-signup`,
                        CHECK: {
                            EMAIL: `${apiHost}/oauth2/check/email`,
                            USERNAME: `${apiHost}/oauth2/check/username`,
                        },
                        DELETE_ACCOUNT: `${apiHost}/oauth2/delete-account`,
                    }
                }
            },
            build: {
                VERSION: DEPLOY_ENV == 'development' ? 'dev' : versionUI,
                RELEASE_NOTES_UI: DEPLOY_ENV == 'development' ? 'Testing release, like: <br>-xyz<br>-abc<br>Cool</b> features coming soon!<br><a href="https://google.it">check this out </a>' : releaseNotesUI,
            }
        })
    };
};