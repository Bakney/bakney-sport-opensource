// Components
import {get} from 'svelte/store';
import {wrap} from 'svelte-spa-router/wrap';
import Profile from './routes/profile/Profile.svelte';
import ConnectedCollaborators from './routes/connectedCollaborators/ConnectedCollaborators.svelte';
import Search from './routes/search/mobile/Search.svelte';
import SearchProfile from './routes/search/profile/Profile.svelte';
import Dashboard from './routes/dashboard/Dashboard.svelte';
import UserDashboard from './routes/userdashboard/Dashboard.svelte';
import PersonasList from './routes/association/personas/PersonasList.svelte';
import MembersList from './routes/association/Members/MembersList.svelte';
import AddMember from './routes/association/Members/add/AddMember.svelte';
import ImportMembers from './routes/association/Members/import/ImportMembers.svelte';
import Template from './routes/association/Members/subscription/Template.svelte';
import PaymentList from './routes/accounting/payment/PaymentList.svelte';
import PaymentListArchive from './routes/accounting/payment/PaymentListArchive.svelte';
import Categories from './routes/accounting/payment/category/Categories.svelte';
import PaymentListUser from './routes/activities/payment/PaymentList.svelte';
import SubscriptionList from './routes/activities/subscription/SubscriptionList.svelte';
import EditSubscription from './routes/activities/subscription/EditSubscription.svelte';
import InvoiceList from './routes/accounting/receipts/ReceiptList.svelte';
import InvoiceListArchive from './routes/accounting/receipts/ReceiptListArchive.svelte';
import SuppliersInvoiceList from './routes/accounting/suppliersInvoice/SuppliersInvoiceList.svelte';
import CustomersInvoiceList from './routes/accounting/customersInvoice/CustomersInvoiceList.svelte';
import CourseList from './routes/association/course/CourseList.svelte';
import CourseListArchive from './routes/association/course/CourseListArchive.svelte';
import AddCourse from './routes/association/course/add/AddCourse.svelte';
import OverviewCourse from './routes/association/course/overview/OverviewCourse.svelte';
import Login from './routes/login/Login.svelte';
import Reset from './routes/login/Reset.svelte';
import NotFound from './routes/error/NotFound.svelte';
import {currentPage, role, subPage, sessionToken} from './store/stores.js';
import Onboarded from './routes/stripe/Onboarded.svelte';
import Onboarding from './routes/stripe/Onboarding.svelte';
import Checkout from './routes/stripe/Checkout.svelte';
import CartCheckout from './routes/stripe/CartCheckout.svelte';
import PaymentLanding from './routes/stripe/PaymentLanding.svelte';
import BalanceSheet from './routes/accounting/balanceSheet/BalanceSheet.svelte';
import MembersListArchive from './routes/association/Members/MembersListArchive.svelte';
import Report from './routes/association/report/Report.svelte';
import Events from './routes/association/events/Events.svelte';
import OverviewEvent from './routes/association/events/overview/OverviewEvent.svelte';
import Detail from './routes/association/Members/detail/Detail.svelte';
import CarnetList from './routes/association/course/carnet/CarnetList.svelte';
import AddCarnet from './routes/association/course/carnet/add/AddCarnet.svelte';
import CarnetDetail from './routes/association/course/carnet/detail/CarnetDetail.svelte';
import Attendance from './routes/activities/subscription/Attendance.svelte';
import Calendar from './routes/activities/subscription/Calendar.svelte';
import SharedCalendar from './routes/calendar/SharedCalendar.svelte';
import CarnetListAthlete from './routes/activities/subscription/CarnetList.svelte';
import AllCarnetList from './routes/activities/carnet/AllCarnetList.svelte';
import AssociationCalendar from './routes/calendar/Calendar.svelte';
import InstructorList from './routes/association/course/instructor/InstructorList.svelte';
import InstructorInfo from './routes/association/course/instructor/info/Instructor.svelte';
import AddInstructor from './routes/association/course/instructor/add/AddInstructor.svelte';
import Subscribe from './routes/subscribe/Subscribe.svelte';
import Invite from './routes/invite/Invite.svelte';
import RuntimeErrors from './routes/errors/RuntimeErrors.svelte';
import Accounts from './routes/accounting/accounts/Accounts.svelte';
import SuppliersAndCustomers from './routes/accounting/suppliers-and-customers/SuppliersAndCustomers.svelte';
import AccountsTransfer from './routes/accounting/accountsTransfer/AccountsTransfer.svelte';
import Settings from './routes/association/communication/settings/Settings.svelte';
import Messages from './routes/association/communication/messages/Messages.svelte';
import Automation from './routes/association/communication/automation/Automation.svelte';
import AutomationEditor from './routes/association/communication/automation/editor/AutomationEditor.svelte';
import EmptyDashboard from './routes/dashboard/EmptyDasbhoard.svelte';
import {canPerformAction} from 'utils/Permissions.js';
import ShareModuleLink from './routes/association/Members/ShareModuleLink.svelte';
import EmailBuilder from 'components/inputs/email-builder/EmailBuilder.svelte';
import Modules from './routes/association/Members/Modules.svelte';
import ModuleComposer from './routes/association/Members/composer/ModuleComposer.svelte';
import PublicModule from './routes/forms/PublicModule.svelte';
import ModuleOverview from './routes/association/Members/overview/ModuleOverview.svelte';
import CampsAndRetreatsList from './routes/association/course/campsAndRetreats/CampsAndRetreatsList.svelte';
import CampsAndRetreatsOverview from './routes/association/course/campsAndRetreats/overview/CampsAndRetreatsOverview.svelte';
import CampsAndRetreatsPeriodOverview from './routes/association/course/campsAndRetreats/overview/CampsAndRetreatsPeriodOverview.svelte';
import CampsAndRetreatsForm from './routes/forms/CampsAndRetreatsForm.svelte';
import MembersBook from 'routes/association/Members/MembersBook.svelte';
import MembersDraft from 'routes/association/Members/MembersDraft.svelte';
import Welcome from 'routes/onboarding/Welcome.svelte';
import Tessera from 'routes/association/Members/detail/sections/subcomponents/Tessera.svelte';
import CourseLocations from 'routes/association/course/CourseLocations.svelte';
import Archive from 'routes/association/archive/Archive.svelte';
import SubscribeMultiple from 'routes/subscribe-multiple/SubscribeMultiple.svelte';
import TemplatesList from 'routes/association/archive/TemplatesList.svelte';

currentPage.useLocalStorage();
subPage.useLocalStorage();
role.useLocalStorage();
sessionToken.useLocalStorage();

const clearKtDatatableMeta = function () {
    localStorage.removeItem('kt_datatable-1-meta');
};

function isLogged() {
    // check if there is a session token
    if (localStorage.getItem('sessionToken') == 'null') {
        localStorage.clear();
        window.location.href = '/#/login';
    }
    return (
        localStorage.getItem('sessionToken') && localStorage.getItem('sessionToken') != 'null'
    );
}

function isPlanActive() {
    // if expired show the renewal page
    subPage.set('');
    const isExpired = localStorage.getItem('isExpired') === 'true';
    if (isExpired) window.location.href = '/#/subscription/upgrade';
    return !isExpired || localStorage.getItem('role') === 'athlete';
}

// Export the route definition object
export default {
    // Exact path
    '/': wrap({
        // Dashboard Component
        component: (async () => {
            while (!get(role)) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!canPerformAction('association.dashboard.read')) {
                if (get(role) == 'association') {
                    return EmptyDashboard;
                }
            }

            return get(role) == 'association' ? Dashboard : UserDashboard;
        })(),

        // Condition is logged
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('dashboard');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/calendar': wrap({
        // load AssociationCalendar component
        component: AssociationCalendar,

        // Condition is logged and plan is active
        conditions: [
            () => {
                if (!canPerformAction('association.calendar.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged() && get(role) == 'association') {
                    currentPage.set('calendar');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/search': wrap({
        component: Search,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('search');
                    subPage.set('info');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/connected-collaborators': wrap({
        component: ConnectedCollaborators,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('users');
                    subPage.set('connected-collaborators');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/profile': wrap({
        component: Profile,

        // Condition is logged and admin
        conditions: [
            () => {
                if (isLogged()) {
                    currentPage.set('profile');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/search/profile/:username?/:subscribe?': wrap({
        component: SearchProfile,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('search');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/personas/list': wrap({
        component: PersonasList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.personas.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('members');
                    subPage.set('personas-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/list': wrap({
        component: MembersList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('members');
                    subPage.set('members-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/members-book': wrap({
        component: MembersBook,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('members');
                    subPage.set('members-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/list-draft': wrap({
        component: MembersDraft,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('members');
                    subPage.set('members-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/list/detail/:subscriptionId/:page?': wrap({
        component: Detail,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('members');
                    subPage.set('detail');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/card/:subscriptionId/:token?/:print?': wrap({
        component: Tessera,
    }),
    '/members/archive': wrap({
        component: MembersListArchive,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('members');
                    subPage.set('members-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/import': wrap({
        component: ImportMembers,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/modules': wrap({
        component: Modules,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.modules.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    subPage.set('modules');
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/modules/composer/:id?': wrap({
        component: ModuleComposer,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.modules.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    subPage.set('modules');
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/modules/overview/:module_id?': wrap({
        component: ModuleOverview,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.modules.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    subPage.set('modules');
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/forms/:custom_link/:response_id?': wrap({
        component: PublicModule,
    }),
    '/members/add': wrap({
        component: AddMember,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.create')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/subscription/template': wrap({
        component: Template,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    subPage.set('members-template');
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/members/subscription/share-module-link': wrap({
        component: ShareModuleLink,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    subPage.set('members-link');
                    currentPage.set('members');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/payment/list/:id?': wrap({
        component: get(role) == 'athlete' ? PaymentListUser : PaymentList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.payments.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('payment');
                    subPage.set('payment-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/payment/archive': wrap({
        component: PaymentListArchive,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.payments.archive.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('payment');
                    subPage.set('payment-archive');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/payment/category/list': wrap({
        component: Categories,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.payments.read')) return false;
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('payment');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/subscribe/:sportAssociationUsername?': wrap({
        component: Subscribe,
    }),
    '/subscribe/:sportAssociationUsername/:preregistration': wrap({
        component: Subscribe,
    }),
    '/subscribe-multiple/:sportAssociationUsername?': wrap({
        component: SubscribeMultiple,
    }),
    '/invite/:token': wrap({
        component: Invite,
    }),
    '/error': wrap({
        component: RuntimeErrors,
    }),
    '/subscription/list': wrap({
        component: SubscriptionList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged() && get(role) == 'athlete') {
                    currentPage.set('subscription');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/carnet/list': wrap({
        component: AllCarnetList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.carnet.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged() && get(role) == 'athlete') {
                    currentPage.set('carnet');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/subscription/detail/:subscriptionId': wrap({
        component: EditSubscription,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('members');
                    subPage.set('detail');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/subscription/list/detail/:subscriptionId/attendance?': wrap({
        component: Attendance,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (isLogged() && get(role) == 'athlete') {
                    currentPage.set('subscription');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/subscription/list/detail/:subscriptionId/calendar?': wrap({
        component: Calendar,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (isLogged() && get(role) == 'athlete') {
                    currentPage.set('subscription');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/subscription/list/detail/:subscriptionId/carnet?': wrap({
        component: CarnetListAthlete,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.members.read')) return false;

                if (isLogged() && get(role) == 'athlete') {
                    currentPage.set('subscription');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/invoice/list': wrap({
        component: InvoiceList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.documents.invoices.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('invoice');
                    subPage.set('invoice-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/invoice/archive': wrap({
        component: InvoiceListArchive,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.documents.invoices.archive.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('invoice');
                    subPage.set('invoice-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/customers-invoice/list': wrap({
        component: CustomersInvoiceList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.documents.clientinvoices.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('invoice');
                    subPage.set('customers-invoice-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/suppliers-invoice/list': wrap({
        component: SuppliersInvoiceList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.documents.supplierinvoices.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('invoice');
                    subPage.set('suppliers-invoice-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/balance-sheet/list': wrap({
        component: BalanceSheet,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.management.balancesheet.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('balance-sheet');
                    subPage.set('balance-sheet-manage');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/accounting/list': wrap({
        component: Accounts,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.management.accounts.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('balance-sheet');
                    subPage.set('accounting-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/suppliers-and-customers/list': wrap({
        component: SuppliersAndCustomers,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.management.suppliers.read')) return false;

                if (!isPlanActive()) return false;
                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('balance-sheet');
                    subPage.set('suppliers-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/accounting-transfer/list': wrap({
        component: AccountsTransfer,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('bookeeping.management.accountstransfers.read')) return false;

                if (!isPlanActive()) return false;
                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('balance-sheet');
                    subPage.set('accounting-transfer-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/list': wrap({
        component: CourseList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.courses.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('course-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/archive': wrap({
        component: CourseListArchive,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.courses.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('course-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/locations': wrap({
        component: CourseLocations,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.courses.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('course-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/camps-and-retreats/forms/:id?': wrap({
        component: CampsAndRetreatsForm,
    }),
    '/course/camps-and-retreats/list': wrap({
        component: CampsAndRetreatsList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.campsandretreats.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('camps-and-retreats-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/camps-and-retreats/overview/:id?': wrap({
        component: CampsAndRetreatsOverview,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.campsandretreats.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('camps-and-retreats-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/camps-and-retreats/overview/:id?/detail/:periodId?': wrap({
        component: CampsAndRetreatsPeriodOverview,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.campsandretreats.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('camps-and-retreats-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/carnet/list': wrap({
        component: CarnetList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.carnet.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('carnet-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/carnet/list/detail/:carnetId/:page?': wrap({
        component: CarnetDetail,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.carnet.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('course');
                    subPage.set('carnet-list');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/course/instructor/list': wrap({
        component: InstructorList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.instructor.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('instructor-list');
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/course/instructor/info/:id': wrap({
        component: InstructorInfo,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.instructor.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('instructor-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/instructor/add': wrap({
        component: AddInstructor,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.instructor.create')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('instructor-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/archive': wrap({
        component: Archive,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.archive.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('archive');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/templates/list': wrap({
        component: TemplatesList,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.templates.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('archive');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/report': wrap({
        component: Report,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.report.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('report');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/events': wrap({
        component: Events,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.events.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('events');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/events/overview/:id?': wrap({
        component: OverviewEvent,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.events.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('course');
                    subPage.set('events');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/add': wrap({
        component: AddCourse,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.courses.create')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('course-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/carnet/add': wrap({
        component: AddCarnet,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.carnet.create')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('course');
                    subPage.set('carnet-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/course/overview/:id?/:page?': wrap({
        component: OverviewCourse,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.courses.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    clearKtDatatableMeta();
                    currentPage.set('course');
                    subPage.set('course-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/communication/messages': wrap({
        component: Messages,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.communication.messages.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('communication');
                    subPage.set('messages-list');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/communication/automation': wrap({
        component: Automation,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.communication.workflows.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('communication');
                    subPage.set('message-automation');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/communication/automation/editor/:workflow_id?': wrap({
        component: AutomationEditor,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.communication.workflows.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('automation');
                    subPage.set('message-automation');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/communication/configuration': wrap({
        component: Settings,

        // Condition is logged and admin
        conditions: [
            () => {
                if (!canPerformAction('association.communication.settings.read')) return false;

                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('communication');
                    subPage.set('message-configuration');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/shared-calendar/:id?': wrap({
        component: SharedCalendar,
    }),
    '/login': wrap({
        component: Login,
        conditions: [
            () => {
                currentPage.set('login');
                return true;
            },
        ],
    }),
    '/stripe/onboarding': wrap({
        component: Onboarding,
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('onboarding');
                    return true;
                } else {
                    sessionStorage.setItem('check_onboarding', true);
                    currentPage.set('login');
                    return false;
                }
            },
            // add another call
        ],
    }),
    '/stripe/onboarded': wrap({
        component: Onboarded,
        conditions: [
            () => {
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('onboarded');
                    return true;
                } else {
                    sessionStorage.setItem('check_onboarded', true);
                    currentPage.set('login');
                    return false;
                }
            },
            // add another call
        ],
    }),
    '/stripe/pay/:id?/:one_fee_payment?': wrap({
        component: Checkout,

        // Condition is logged and admin
        conditions: [
            () => {
                currentPage.set('payment');
                return true;
                if (!isPlanActive()) return false;

                if (isLogged()) {
                    currentPage.set('payment');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/stripe/cart-pay': wrap({
        component: CartCheckout,

        // Condition is logged and admin
        conditions: [
            () => {
                if (isLogged()) {
                    currentPage.set('payment');
                    return true;
                }
            },
            // add another call
        ],
    }),
    '/stripe/payment/done': wrap({
        component: PaymentLanding,

        // Condition is logged and admin
        conditions: [
            () => {
                currentPage.set('payment');
                return true;
            },
            // add another call
        ],
    }),

    '/welcome': wrap({
        component: Welcome,

        // Condition is logged and admin
        conditions: [
            () => {
                if (isLogged()) {
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/email-builder/:id/:workflow_id': wrap({
        component: EmailBuilder,

        // Condition is logged and admin
        conditions: [
            () => {
                if (isLogged()) {
                    return true;
                }
            },
            // add another call
        ],
    }),

    '/reset': Reset,

    // Catch-all, must be last
    '*': NotFound,
};
