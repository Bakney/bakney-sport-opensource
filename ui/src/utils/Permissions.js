import {permissions} from 'store/stores.js';

export const allPermissions = [
    // dashboard
    'association.dashboard.read',

    // ticketing
    'association.ticketing.create',

    // calendar
    'association.calendar.read',

    // personas
    'association.personas.read',
    'association.personas.create',
    'association.personas.update',
    'association.personas.delete',

    // templates
    'association.templates.read',
    'association.templates.create',
    'association.templates.update',
    'association.templates.delete',

    // members
    'association.members.read',
    'association.members.create',
    'association.members.update',
    'association.members.delete',

    // members archive
    'association.members.archive.read',
    'association.members.archive.update',

    // modules
    'association.modules.read',
    'association.modules.create',
    'association.modules.update',
    'association.modules.delete',

    // courses
    'association.courses.read',
    'association.courses.create',
    'association.courses.update',
    'association.courses.delete',

    // camps and retreats
    'association.campsandretreats.read',
    'association.campsandretreats.create',
    'association.campsandretreats.update',
    'association.campsandretreats.delete',

    // courses archive
    // 'association.courses.archive.read',
    // 'association.courses.archive.update',

    // carnet
    'association.carnet.read',
    'association.carnet.create',
    'association.carnet.update',
    'association.carnet.delete',

    // instructor
    'association.instructor.read',
    'association.instructor.create',
    'association.instructor.update',
    'association.instructor.delete',

    // instructor hours
    'association.instructor.hours.read',
    'association.instructor.hours.create',
    'association.instructor.hours.update',
    'association.instructor.hours.delete',

    // attendance
    'association.courses.attendance.read',
    'association.courses.attendance.update',

    // archive
    'association.archive.read',
    'association.archive.update',

    // report
    'association.report.read',

    // events
    'association.events.read',
    'association.events.create',
    'association.events.update',
    'association.events.delete',

    // events archive
    // 'association.events.archive.read',
    // 'association.events.archive.update',

    // communication
    'association.communication.messages.read',
    'association.communication.messages.create',
    'association.communication.messages.update',
    'association.communication.messages.delete',

    // communication workflows
    'association.communication.workflows.read',
    'association.communication.workflows.create',
    'association.communication.workflows.update',
    'association.communication.workflows.delete',

    // communication settings
    'association.communication.settings.read',
    'association.communication.settings.update',

    // payments
    'bookeeping.payments.read',
    'bookeeping.payments.create',
    'bookeeping.payments.update',
    'bookeeping.payments.delete',

    // payments archive
    'bookeeping.payments.archive.read',
    'bookeeping.payments.archive.update',

    // invoices
    'bookeeping.documents.invoices.read',
    'bookeeping.documents.invoices.create',
    'bookeeping.documents.invoices.update',
    'bookeeping.documents.invoices.delete',

    // invoice archive
    'bookeeping.documents.invoices.archive.read',
    'bookeeping.documents.invoices.archive.update',

    // client invoices
    'bookeeping.documents.clientinvoices.read',
    'bookeeping.documents.clientinvoices.create',
    'bookeeping.documents.clientinvoices.update',
    'bookeeping.documents.clientinvoices.delete',

    // supplier invoices
    'bookeeping.documents.supplierinvoices.read',
    'bookeeping.documents.supplierinvoices.create',
    'bookeeping.documents.supplierinvoices.update',
    'bookeeping.documents.supplierinvoices.delete',

    // suppliers
    'bookeeping.management.suppliers.read',
    'bookeeping.management.suppliers.create',
    'bookeeping.management.suppliers.update',
    'bookeeping.management.suppliers.delete',

    // accounts
    'bookeeping.management.accounts.read',
    'bookeeping.management.accounts.create',
    'bookeeping.management.accounts.update',
    'bookeeping.management.accounts.delete',

    // accounts transfers
    'bookeeping.management.accountstransfers.read',
    'bookeeping.management.accountstransfers.create',
    'bookeeping.management.accountstransfers.update',
    'bookeeping.management.accountstransfers.delete',

    // balance sheet
    'bookeeping.management.balancesheet.read',
    'bookeeping.management.balancesheet.update',

    // collaborators
    'other.users.collaborators.read',
    'other.users.collaborators.create',
    'other.users.collaborators.update',
    'other.users.collaborators.delete',

    // connected athletes
    'other.users.connectedathletes.read',
    'other.users.connectedathletes.delete',

    // settings
    'other.settings.read',
    'other.settings.update',

    // notifications
    'other.notifications.read',
];

permissions.useLocalStorage();
// prettier-ignore
const planBasedResources = {
    1: [
        'association.dashboard.read',
        'association.personas.read',
        'association.personas.create',
        'association.personas.update',
        'association.personas.delete',
        'association.templates.read',
        'association.templates.create',
        'association.templates.update',
        'association.templates.delete',
        'association.members.read',
        'association.members.create',
        'association.members.update',
        'association.members.delete',
        'association.courses.read',
        'association.courses.create',
        'association.courses.update',
        'association.courses.delete',
        'association.campsandretreats.read',
        'association.campsandretreats.create',
        'association.campsandretreats.update',
        'association.campsandretreats.delete',
        'bookeeping.payments.read',
        'bookeeping.payments.create',
        'bookeeping.payments.update',
        'bookeeping.payments.delete',
        'bookeeping.documents.invoices.read',
        'bookeeping.documents.invoices.create',
        'bookeeping.documents.invoices.update',
        'bookeeping.documents.invoices.delete',
        'association.calendar.read',
        'association.ticketing.create',
        'association.events.read',
        'association.events.create',
        'association.events.update',
        'association.events.delete',
        'other.users.connectedathletes.read',
        'other.users.connectedathletes.delete',
        'other.settings.read',
        'other.settings.update',
        'other.notifications.read',
    ],
    2: [
        'association.modules.read',
        'association.modules.create',
        'association.modules.update',
        'association.modules.delete',
        'association.members.archive.read',
        'association.members.archive.update',
        'association.carnet.read',
        'association.carnet.create',
        'association.carnet.update',
        'association.carnet.delete',
        'association.instructor.read',
        'association.instructor.create',
        'association.instructor.update',
        'association.instructor.delete',
        'association.courses.attendance',
        'association.instructor.hours.read',
        'association.instructor.hours.create',
        'association.instructor.hours.update',
        'association.instructor.hours.delete',
        'association.courses.attendance.read',
        'association.courses.attendance.update',
        'association.archive.read',
        'association.archive.update',
        'association.report.read',
        'bookeeping.payments.archive.read',
        'bookeeping.payments.archive.update',
        'bookeeping.documents.invoices.archive.read',
        'bookeeping.documents.invoices.archive.update',
        'bookeeping.documents.clientinvoices.read',
        'bookeeping.documents.clientinvoices.create',
        'bookeeping.documents.clientinvoices.update',
        'bookeeping.documents.clientinvoices.delete',
        'bookeeping.documents.supplierinvoices.read',
        'bookeeping.documents.supplierinvoices.create',
        'bookeeping.documents.supplierinvoices.update',
        'bookeeping.documents.supplierinvoices.delete',
        'bookeeping.management.suppliers.read',
        'bookeeping.management.suppliers.create',
        'bookeeping.management.suppliers.update',
        'bookeeping.management.suppliers.delete',
        'bookeeping.management.accounts.read',
        'bookeeping.management.accounts.create',
        'bookeeping.management.accounts.update',
        'bookeeping.management.accounts.delete',
        'bookeeping.management.accountstransfers.read',
        'bookeeping.management.accountstransfers.create',
        'bookeeping.management.accountstransfers.update',
        'bookeeping.management.accountstransfers.delete',
        'bookeeping.management.balancesheet.read',
        'bookeeping.management.balancesheet.update',
        'other.users.collaborators.read',
        'other.users.collaborators.create',
        'other.users.collaborators.update',
        'other.users.collaborators.delete',
        'association.communication.messages.read',
        'association.communication.messages.create',
        'association.communication.messages.update',
        'association.communication.messages.delete',
        'association.communication.workflows.read',
        'association.communication.workflows.create',
        'association.communication.workflows.update',
        'association.communication.workflows.delete',
        'association.communication.settings.read',
        'association.communication.settings.update',
    ],
    3: [
        // 'association.secretary',
        // 'association.collaboration.full',
        // 'association.communication.full',
    ]
};

const permissionsMap = {
    1: {
        association: planBasedResources[1],
    },
    2: {
        association: [...planBasedResources[1], ...planBasedResources[2]],
    },
    3: {
        association: [...planBasedResources[1], ...planBasedResources[2], ...planBasedResources[3]],
    },
};

export const isFreePlan = function () {
    const billingData = localStorage.getItem('billingData');
    const activePlan = billingData ? JSON.parse(billingData)?.active_plan : 1;
    return activePlan?.billing_type === 1;
};

/**
 * this function is used to set the permissions for the user base on plan and role
 * @param {*} planType {1, 2, 3} where 1 is base plan, 2 is pro plan and 3 is teams plan
 * @param {*} role {association, athlete, secretary}
 */
export const setPermissions = function (planType, role) {
    localStorage.removeItem('permissions');
    // get collaborators permissions list from local storage userData
    const userData = localStorage.getItem('userData');
    // get collaborator permissions if set in userData
    const collaboratorPermissions = (userData && JSON.parse(userData).collaborator_permissions) || null;
    //console.debug('PERMISSIONS:', collaboratorPermissions);
    // if the collaborator has permissions, set them
    if (collaboratorPermissions && JSON.parse(userData).collaborator_role != 1) {
        if (collaboratorPermissions.length > 0 && JSON.parse(userData).collaborator_role != 1) {
            // if the collaborator has permissions, set them
            permissions.set(collaboratorPermissions);
            return;
        } else if (collaboratorPermissions.length == 0) {
            permissions.set(['association.ticketing.create', 'other.settings.read']);
            return;
        }
    }
    // if it's not set, set it to the default, this is also set all persmissions to collaborator role 1
    if (permissionsMap[planType][role] === undefined) return;

    // set all permissions
    permissions.set(allPermissions);

    // try {
    //     // permissions.set(permissionsMap[planType][role]);
    // } catch (error) {
    //     console.warn('setPermissions error setting default', error);
    //     // permissions.set(permissionsMap[1]['association']);
    // }
};

/**
 * this function is used to check if the user can perform an action
 * @param {*} action is a resource name like 'association.dashboard'
 * @returns true if the user can perform the action, false otherwise
 */
export const canPerformAction = function (action, perms = []) {
    if (perms.length === 0) {
        let permissions = [];
        try {
            permissions = JSON.parse(localStorage.getItem('permissions')) || [];
        } catch (error) {
            console.error('Permissions not valid', error);
        }

        if (!permissions || permissions.length == 0) {
            setTimeout(() => {
                if (JSON.parse(localStorage.getItem('role')) === 'athlete') {
                    return;
                }
                if (location.href != '/welcome') {
                    return;
                }
                window.location.reload();
            }, 500);
            return JSON.parse(localStorage.getItem('role')) === 'athlete';
        }
        //console.info('permissions', permissions, permissions.length);
        return permissions.includes(action);
    }
    return perms.includes(action);
};

// export const canCollaboratorPerformAction = function (action) {
//     // get collaborators permissions list from local storage userData
//     const userData = localStorage.getItem('userData');
//     // get collaborator permissions if set in userData
//     const collaboratorPermissions = (userData && JSON.parse(userData).collaborator_permissions) || null;
//     if (collaboratorPermissions) {
//         return canPerformAction(action, collaboratorPermissions);
//     } else {
//         return true;
//     }
// };
