<script>
    import PrintingModal from 'components/modals/PrintingModal.svelte';
    import CertificateButton from 'components/buttons/CertificateButton.svelte';
    import {
        sessionToken,
        userData,
        permissions,
        tablesSettings,
        subscriptionListFilter,
        subscriptionListFilterDatatable,
    } from 'store/stores.js';
    import {apiFetch, replaceUID, updateTableSettings} from 'utils/ApiMiddleware.js';
    import {onDestroy, onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {canPerformAction} from 'utils/Permissions.js';
    import {SmartSelect} from 'components/formBuilder/preview-blocks';
    import {
        ShareNetwork,
        Printer,
        ArchiveBox,
        UserSwitch,
        CheckCircle,
        Tag,
        TrashSimple,
        PlusCircle,
        Funnel,
        Warning,
        Repeat,
        SlidersHorizontal,
        Wallet,
        FileArrowUp,
        PenNib,
        FileArrowDown,
        FirstAidKit,
        Users,
        Coins,
        UserCirclePlus,
        XCircle as XCircleIcon,
        Link,
    } from 'phosphor-svelte';
    import {params, push} from 'svelte-spa-router';
    import {slide} from 'svelte/transition';
    import ApproveButton from 'components/buttons/ApproveButton.svelte';
    import {clearLocalStorageForPartialMatching, debounce, waitForElementAndExecute} from 'utils/Functions';
    import XCircle from 'components/buttons/XCircle.svelte';
    import MoreActionsButton from 'components/buttons/MoreActionsButton.svelte';
    import PaymentModal from './modals/PaymentModal.svelte';
    import RepeatButton from 'components/buttons/RepeatButton.svelte';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import MoveToArchiveButton from 'components/buttons/MoveToArchiveButton.svelte';
    import SignatureModal from './modals/SignatureModal.svelte';
    import DocumentPreviewModal from 'components/modals/DocumentPreviewModal.svelte';
    import DocumentButton from 'components/buttons/DocumentButton.svelte';
    import CurrentViewPrintingModal from 'components/modals/CurrentViewPrintingModal.svelte';
    import ShareModuleSubscriptionLink from 'components/modals/ShareModuleSubscriptionLink.svelte';
    import NavigationTab from './shared/NavigationTab.svelte';
    import {toast} from 'svelte-sonner';
    import {MembersListTypeLabel, typesOfAssociates} from 'utils/enumUtils';
    import ExpandPayments from 'components/buttons/ExpandPayments.svelte';
    import ExportData from './shared/ExportData.svelte';
    import RenewalModal from './modals/RenewalModal.svelte';
    import DetailDrawer from './detail/DetailDrawer.svelte';
    import QueryFilter from 'components/filters/QueryFilter.svelte';
    import NotesButton from 'components/buttons/NotesButton.svelte';
    import ShareModulePresubscriptionLink from 'components/modals/ShareModulePresubscriptionLink.svelte';

    sessionToken.useLocalStorage();
    userData.useLocalStorage();
    tablesSettings.useLocalStorage();

    let subscriptionId = null;
    let certificate_expring_date = moment().format('DD/MM/YYYY');
    let isValid = false;
    let uploadedFile = false;
    let datatable;
    let ktdatable;

    let selectedCounter = 0;
    let visibleMultiaction = false;
    let tags;
    let searchTagName = '';
    let aiSuggestion = false;

    let filters = [
        {
            name: 'Filtra Tag ',
            value: '',
            active: false,
            type: 'tags',
            key: 'tags',
            data: {
                options: [],
                and: true,
            },
        },
        {
            name: 'Età ',
            value: '',
            active: false,
            type: 'age',
            key: 'age',
            data: {
                options: [],
                and: true,
            },
        },
    ];

    const statusTextDictionary = {
        1: '<span class="label label-light-info label-inline font-weight-bolder label-lg">non firmata</span>',
        2: '<span class="label label-light-warning label-inline font-weight-bolder label-lg">in attesa</span>',
        3: '<span class="label label-light-danger label-inline font-weight-bolder label-lg">rifiutata</span>',
        4: '<span class="label label-light-success label-inline font-weight-bolder label-lg">accettata</span>',
        5: '<span class="label label-light label-inline font-weight-bolder label-lg">ritirata/o</span>',
    };

    const statusCurrentYearDictionary = {
        0: '<span><span class="label label-warning label-dot mr-2"></span><span class="font-weight-bold text-warning">precedente</span></span>',
        1: '<span><span class="label label-success label-dot mr-2"></span><span class="font-weight-bold text-success">corrente</span></span>',
        3: '<span><span class="label label-info label-dot mr-2"></span><span class="font-weight-bold text-info">preiscritto</span></span>',
    };

    const statusMedicalCertificateDictionary = {
        valid: '<span class="font-weight-bolder"><span class="label label-success label-dot mr-2"></span>[DAYS] giorni</span>',
        expiring:
            '<span class="font-weight-bolder"><span class="label label-warning label-dot mr-2"></span>[DAYS] giorni</span>',
        expired:
            '<span class="font-weight-bolder text-danger"><span class="label label-danger label-dot mr-2"></span>scaduto</span>',
        not_present:
            '<span class="font-weight-bolder text-danger"><span class="label label-danger label-dot mr-2"></span>scadenza mancante</span>',
    };

    const statusMedicalCertificateLabelDictionary = {
        not_required:
            '<span class="font-weight-bolder" style="font-size: 0.9rem;"><span class="label label-secondary label-dot mr-2"></span>[LABEL]</span>',
        valid: '<span class="font-weight-bolder" style="font-size: 0.9rem;"><span class="label label-success label-dot mr-2"></span>[LABEL]</span>',
        expiring:
            '<span class="font-weight-bolder" style="font-size: 0.9rem;"><span class="label label-warning label-dot mr-2"></span>[LABEL]</span>',
        expired:
            '<span class="font-weight-bolder text-danger" style="font-size: 0.9rem;"><span class="label label-danger label-dot mr-2"></span>[LABEL]</span>',
        not_present:
            '<span class="font-weight-bolder text-danger" style="font-size: 0.9rem;"><span class="label label-danger label-dot mr-2"></span>[LABEL]</span>',
    };

    let columns = [
        {
            field: 'subscription_id',
            title: '#',
            sortable: false,
            autoHide: false,
            width: 20,
            selector: {
                class: '',
            },
            textAlign: 'center',
        },
        {
            field: 'associate',
            title: 'Tesserato',
            checked: true,
            autoHide: false,
            sortable: true,
            minWidth: '100%',
            width: 150,
            fireClick: true,
            template: function (row) {
                let name = capitalizeWords(`${row.associate.first_name} ${row.associate.last_name}`);
                if (name == ' ') name = '- -';
                let content =
                    "<div class='font-weight-200 ml-2 mr-2'><div class='mb-2'>" +
                    row.associate?.born_date +
                    ' (' +
                    (row.associate?.is_minor ? 'Minore' : 'Adulto') +
                    ')' +
                    "</div><div class='mb-2'>" +
                    (row.associate?.sex == 'F'
                        ? "Femmina <i class='fas fa-female ml-2 mr-2'></i>"
                        : row.associate?.sex == 'M'
                        ? "Maschio <i class='fas fa-male ml-2 mr-2'></i>"
                        : "Altro <i class='fas fa-transgender ml-2 mr-2'></i>") +
                    "</div><div class='mb-0'> C.F. " +
                    row.associate?.tax_code?.toUpperCase() +
                    '</div></div>';
                return (
                    '<div style="line-height: 1.1">' +
                    (KTUtil.isMobileDevice()
                        ? `<span class="navi-text font-weight-bolder text-hover-primary text-primary">` +
                          name +
                          '</span>'
                        : `<span class="navi-text font-weight-bolder text-hover-primary text-primary">` +
                          '<span id="popover-sub-detail" style="cursor:pointer" ' +
                          'data-toggle="popover" data-trigger="hover" title="' +
                          row.associate.first_name?.charAt(0)?.toUpperCase() +
                          row.associate.first_name?.slice(1) +
                          (name == '- -' ? '-' : '') +
                          ' ' +
                          row.associate.last_name?.charAt(0)?.toUpperCase() +
                          row.associate.last_name?.slice(1) +
                          (name == '- -' ? '-' : '') +
                          '" data-html="true" ' +
                          'data-content="' +
                          content +
                          '">' +
                          name +
                          '</span></span>') +
                    '<br><span class="font-size-xs text-dark-65">' +
                    MembersListTypeLabel[row.type] +
                    '</span></div>'
                );
            },
        },
        {
            field: 'status_flag',
            title: 'Stato',
            checked: true,
            width: 100,
            fireClick: true,
            responsive: {
                visible: 'lg',
                hidden: 'md',
            },
            sortCallback: function (data, sort, column) {
                let statusArray = Object.values(data);

                statusArray.sort(function (a, b) {
                    let timeA = parseInt(a['status_flag']);
                    let timeB = parseInt(b['status_flag']);
                    if (sort === 'asc') {
                        return timeA > timeB ? 1 : timeA < timeB ? -1 : 0;
                    } else {
                        return timeA < timeB ? 1 : timeA > timeB ? -1 : 0;
                    }
                });
                let newData = {};
                for (let i = 0; i < statusArray.length; i++) {
                    newData[i] = statusArray[i];
                }

                return newData;
            },
            template: function (row) {
                return statusTextDictionary[row.status_flag];
            },
        },
        {
            field: 'age',
            title: 'Età',
            checked: true,
            sortable: true,
            width: 50,
            fireClick: true,
            responsive: {
                visible: 'xxl',
                hidden: 'xl',
            },
            template: function (row) {
                return `<span class="font-weight-boldest">${row.age}</span>`;
            },
        },
        {
            field: 'current_year',
            title: 'Anno',
            checked: true,
            sortable: false,
            width: 100,
            fireClick: true,
            responsive: {
                visible: 'xxl',
                hidden: 'xl',
            },
            template: function (row) {
                let key = row?.current_year && !row?.next_years ? 1 : 0;
                if (row?.next_years) key = 3;
                return statusCurrentYearDictionary[key];
            },
        },
        {
            field: 'medical',
            title: 'Certificato',
            checked: true,
            sortable: false,
            width: 150,
            fireClick: true,
            template: function (row) {
                const currentDate = new Date();
                const expirationDate = new Date(row.medical_expiration_date);
                let daysLeft = Math.max(Math.floor((expirationDate - currentDate) / (1000 * 60 * 60 * 24)), 0);
                // calculate age from row.associate.born_date with moment.js
                // alert(moment(row.associate.born_date));
                let age_in_years = moment().diff(moment(row.associate?.born_date), 'years');

                // if (age_in_years < 6 && __bakney.OEM_CONFIG?.showMinorExemption) {
                //     return '<span class="font-weight-bolder"><span class="label label-secondary label-dot mr-2"></span>esente</span>';
                // }

                let medicalCertificateKey = 'not_present';

                if (row.medical != null) {
                    if (daysLeft <= 0) {
                        medicalCertificateKey = 'expired';
                    } else if (daysLeft <= 30) {
                        medicalCertificateKey = 'expiring';
                    } else {
                        medicalCertificateKey = 'valid';
                    }
                }

                if (age_in_years < 6 && __bakney.OEM_CONFIG?.showMinorExemption) {
                    medicalCertificateKey = 'not_required';
                }

                return statusMedicalCertificateLabelDictionary[medicalCertificateKey].replace(
                    '[LABEL]',
                    row.plain_medical_label
                );
            },
        },
        {
            field: 'creation_date',
            title: 'Data',
            checked: true,
            width: 80,
            type: 'date',
            fireClick: true,
            responsive: {
                visible: 'xxxxl',
                hidden: 'xxxl',
            },
            sortCallback: function (data, sort, column) {
                let dataArray = Object.values(data);
                dataArray.sort(function (a, b) {
                    let timeA = new Date(a['creation_date']).getTime();
                    let timeB = new Date(b['creation_date']).getTime();
                    if (sort === 'asc') {
                        return parseFloat(timeA) > parseFloat(timeB)
                            ? 1
                            : parseFloat(timeA) < parseFloat(timeB)
                            ? -1
                            : 0;
                    } else {
                        return parseFloat(timeA) < parseFloat(timeB)
                            ? 1
                            : parseFloat(timeA) > parseFloat(timeB)
                            ? -1
                            : 0;
                    }
                });
                let newData = {};
                for (let i = 0; i < dataArray.length; i++) {
                    newData[i] = dataArray[i];
                }

                return newData;
            },
            template: function (row) {
                return moment(new Date(row.creation_date)).format('DD/MM/YYYY');
            },
        },
        {
            field: 'user',
            title: 'Utente',
            checked: true,
            sortable: false,
            width: 130,
            minWidth: '100%',
            fireClick: true,
            responsive: {
                visible: 'xxxl',
                hidden: 'xxl',
            },
            template: function (row) {
                return `<a class="navi-text font-weight-bold text-lowercase text-hover-primary" href="/#/search/profile/${row.user?.username}">${row.user?.username}</a>`;
            },
        },
        {
            field: 'tags',
            title: 'Tag',
            checked: true,
            sortable: false,
            width: 250,
            minWidth: '100%',
            fireClick: true,
            // responsive: {
            //     visible: 'xl',
            //     hidden: 'lg',
            // },
            template: function (row) {
                let tags = '';
                row.tags.forEach(tag => {
                    tags += `<span class="label label-inline label-outline-secondary mb-1 mt-0 ml-1 mr-0" style="height: fit-content !important;">${tag?.tag_name}</span>`;
                });

                if (tags == '') {
                    tags = '-';
                }
                return '<div class="d-flex flex-wrap" style="gap:0.1rem">' + tags + '</div>';
            },
        },
        {
            field: 'all_payments_paid',
            title: 'Pagamenti',
            sortable: false,
            checked: false,
            width: 120,
            fireClick: false,
            responsive: {
                visible: 'lg',
                hidden: 'md',
            },
            template: function (row) {
                waitForElementAndExecute(`#payments-col-${row.subscription_id}`, () => {
                    if (document.querySelector(`#payments-col-${row.subscription_id}`))
                        document.querySelector(`#payments-col-${row.subscription_id}`).innerHTML = '';

                    const paymentsCol = document.querySelector(`#payments-col-${row.subscription_id}`);
                    paymentsCol.innerHTML = ''; // Clear previous content

                    const paymentsBtn = new ExpandPayments({
                        target: paymentsCol,
                        intro: true,
                        props: {
                            disabled: false,
                            popover_text: 'Vedi pagamenti',
                            color: row.all_payments_paid ? 'success' : 'warning',
                            text: row.all_payments_paid
                                ? `Saldati`
                                : `${new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(
                                      row.payments_info?.to_be_paid
                                  )}`,
                        },
                    });

                    paymentsBtn.$on('open', data => {
                        let paymentModal = new PaymentModal({
                            target: paymentsCol,
                            props: {
                                id: row.subscription_id,
                                associate_id: row.associate.associate_id,
                                subscription_id: row.subscription_id,
                                show: true,
                            },
                        });

                        // reload datatable on close
                        paymentModal.$on('close', data => {
                            setTimeout(() => {
                                jQuery('#kt_datatable').KTDatatable('reload');
                            }, 400);
                        });
                    });
                });
                return `<div id="payments-col-${row.subscription_id}" class="action-column pr-4 d-flex align-items-center"></div>`;
            },
        },

        ...($userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !==
        undefined
            ? [
                  {
                      field: 'custom_data',
                      title: 'Palestra',
                      checked: true,
                      sortable: false,
                      autoHide: false,
                      overflow: 'visible',
                      width: 150,
                      fireClick: true,
                      template: function (row) {
                          return row.custom_data?.school_name || '-';
                      },
                  },
              ]
            : []),
        {
            field: 'documenti',
            title: 'Info',
            checked: true,
            sortable: false,
            autoHide: false,
            overflow: 'visible',
            width: 75,
            template: function (row) {
                let pdfLink =
                    __bakney.env.HOST +
                    '/document/retrieve/' +
                    row.document +
                    '?download=false&token=' +
                    row.document_token;
                let medicalPdfLink = null;
                if (row.medical != null)
                    medicalPdfLink =
                        __bakney.env.HOST +
                        '/document/retrieve/' +
                        row.medical +
                        '?download=false&token=' +
                        row.medical_token;

                waitForElementAndExecute(`#info-col-${row.subscription_id}`, () => {
                    if (document.querySelector(`#info-col-${row.subscription_id}`))
                        document.querySelector(`#info-col-${row.subscription_id}`).innerHTML = '';

                    let documentButton = new DocumentButton({
                        target: document.querySelector(`#info-col-${row.subscription_id}`),
                        intro: true,
                        props: {
                            disabled: !row.document_pdf,
                            popover_text: `Vedi modulo d'iscrizione di ${row.associate.first_name} ${row.associate.last_name}`,
                        },
                    });

                    documentButton.$on('open', data => {
                        let filePreview = new DocumentPreviewModal({
                            target: document.querySelector(`#info-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                pdfLink: pdfLink,
                                id: row.subscription_id,
                                title: `Modulo d'iscrizione di ${row.associate.first_name} ${row.associate.last_name}`,
                            },
                        });
                    });

                    if (medicalPdfLink != null && row.medical_token) {
                        let certificateButton = new CertificateButton({
                            target: document.querySelector(`#info-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: false,
                                popover_text: `Scarica certificato medico di ${row.associate.first_name} ${row.associate.last_name}`,
                            },
                        });

                        certificateButton.$on('open', data => {
                            let filePreview = new DocumentPreviewModal({
                                target: document.querySelector(`#info-col-${row.subscription_id}`),
                                intro: true,
                                props: {
                                    pdfLink: medicalPdfLink,
                                    id: row.subscription_id,
                                    title: `Certificato medico di ${row.associate.first_name} ${row.associate.last_name}`,
                                },
                            });
                        });
                    }
                });

                return `<div id="info-col-${row.subscription_id}" class="info-column pr-4"></div>`;
            },
        },
        {
            field: 'Azioni',
            title: '',
            sortable: false,
            overflow: 'visible',
            textAlign: 'right',
            minWidth: '100%',
            autoHide: false,
            fireClick: false,
            width: 140,
            template: function (row) {
                waitForElementAndExecute(`#action-col-${row.subscription_id}`, () => {
                    if (document.querySelector(`#action-col-${row.subscription_id}`))
                        document.querySelector(`#action-col-${row.subscription_id}`).innerHTML = '';

                    let disableApproval = row.status_flag && row.status_flag == 4;
                    let disableReject = row.status_flag && row.status_flag == 3;

                    if (row.notes) {
                        let notesButton = new NotesButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                notes: row.notes,
                            },
                        });
                    }

                    if (row?.current_year || row?.next_years) {
                        let approveBtn = new ApproveButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: disableApproval || !canPerformAction('association.members.update'),
                                hidden: false,
                                popover_text: 'Approva Iscrizione',
                            },
                        });
                        approveBtn.$on('open', data => {
                            window.acceptSubscription(row.subscription_id);
                        });
                        let rejectBtn = new XCircle({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: disableReject || !canPerformAction('association.members.update'),
                                hidden: false,
                                popover_text: 'Rifiuta Iscrizione',
                            },
                        });
                        rejectBtn.$on('open', data => {
                            window.rejectSubscription(row.subscription_id);
                        });

                        let moreActionsButton = new MoreActionsButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: !canPerformAction('association.members.delete'),
                                hidden: false,
                                id: row.subscription_id,
                                actions: [
                                    {
                                        icon: PenNib,
                                        label: 'Firma',
                                        action: () => {
                                            // init SignatureModal
                                            let signatureModal = new SignatureModal({
                                                target: document.querySelector(`#action-col-${row.subscription_id}`),
                                                props: {
                                                    id: row.subscription_id,
                                                    show: true,
                                                },
                                            });

                                            // listen for close event
                                            signatureModal.$on('close', data => {
                                                // reload datatable
                                                jQuery('#kt_datatable').KTDatatable('reload');
                                            });
                                        },
                                    },
                                    {
                                        icon: Wallet,
                                        label: 'Pagamenti',
                                        action: () => {
                                            // init PaymentModal
                                            let paymentModal = new PaymentModal({
                                                target: document.querySelector(`#action-col-${row.subscription_id}`),
                                                props: {
                                                    id: row.subscription_id,
                                                    associate_id: row.associate.associate_id,
                                                    subscription_id: row.subscription_id,
                                                    show: true,
                                                },
                                            });
                                        },
                                    },
                                    {
                                        icon: FileArrowUp,
                                        label: 'Carica Certificato',
                                        action: () => window.updateSubscription(row.subscription_id),
                                        dataToggle: 'modal',
                                        dataTarget: '#uploadMedicalCertificateModal',
                                    },
                                    {
                                        icon: TrashSimple,
                                        label: 'Elimina',
                                        action: () => window.deleteSubscription(row.subscription_id),
                                        color: 'danger',
                                    },
                                ],
                            },
                        });
                    } else if (!row?.current_year && !row?.next_years) {
                        let renewBtn = new RepeatButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: !row.renewal_available,
                                hidden: false,
                                popover_text: 'Rinnova Iscrizione',
                            },
                        });
                        renewBtn.$on('open', data => {
                            // window.renewSubscription(row.associate?.associate_id);

                            let renewalModal = new RenewalModal({
                                target: document.querySelector(`#action-col-${row.subscription_id}`),
                                props: {
                                    id: row.subscription_id,
                                    show: true,
                                    formData: row,
                                },
                            });

                            // listen for confirm event
                            renewalModal.$on('confirm', data => {
                                // reload datatable
                                jQuery('#kt_datatable').KTDatatable('reload');
                                // delete renewal modal
                                renewalModal.$destroy();
                            });
                        });
                        let archiveBtn = new MoveToArchiveButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: !canPerformAction('association.members.update'),
                                hidden: false,
                                popover_text: 'Archivia Iscrizione',
                            },
                        });
                        archiveBtn.$on('open', data => {
                            window.archiveSubscription(row.subscription_id);
                        });
                    } else {
                        let deleteBtn = new DeleteButton({
                            target: document.querySelector(`#action-col-${row.subscription_id}`),
                            intro: true,
                            props: {
                                disabled: false,
                            },
                        });

                        deleteBtn.$on('open', data => {
                            window.deleteSubscription(row.subscription_id);
                        });
                    }
                });
                return `<div id="action-col-${row.subscription_id}" class="action-column pr-4"></div>`;
            },
        },
    ];
    let visibleColumns = [...columns.filter(column => column.checked || column.title == '' || column.title == '#')];
    window.updateSubscription = id => {
        subscriptionId = id;
    };

    $: {
        isValid = !moment(certificate_expring_date, 'DD/MM/YYYY').isBefore(moment());
    }

    function handleFilterApplied(event) {
        // remove tags from filterObj
        let filterObj = generateFilterObject();
        let t_list = filterObj?.tags?.join(',') || [];
        let tags_and = filterObj?.tags_and == true ? 1 : 0;
        let from_age = filterObj?.from_age || '';
        let to_age = filterObj?.to_age || '';
        $subscriptionListFilter = {
            ...$subscriptionListFilter,
            ...filterObj,
            tags: t_list,
            tags_and: tags_and,
            from_age: from_age,
            to_age: to_age,
        };
        // apply search
        datatable?.setDataSourceParams($subscriptionListFilterDatatable);
    }

    function generateFilterObject() {
        let filterObj = {};
        filters.forEach(filter => {
            if (filter.active) {
                if (filter.type === 'date-range') {
                    filterObj[filter.key] = filter.data;
                } else if (filter.type === 'checkbox') {
                    filterObj[filter.key] = filter.data.options
                        .filter(option => option.checked)
                        .map(option => option.value);
                } else if (filter.type === 'tags') {
                    filterObj[filter.key] = filter.data.options
                        .filter(option => option.checked)
                        .map(option => option.tag_id);
                    filterObj['tags_and'] = filter.data.and == 1;
                } else if (filter.type === 'radio') {
                    filterObj[filter.key] = filter.value;
                } else if (filter.type === 'age') {
                    filterObj['from_age'] = filter.data.from_age;
                    filterObj['to_age'] = filter.data.to_age;
                }
            }
        });
        return filterObj;
    }

    async function fetchTags() {
        apiFetch(__bakney.env.API.SUBSCRIPTION.TAGS.LIST, {
            method: 'GET',
        }).then(res => {
            if (res.status == 200) {
                tags = [...res.response?.tags];
                // update filter options
                filters.find(filter => filter.key === 'tags').data.options = tags;
                filters = [...filters];
            }
        });
    }

    async function createTag() {
        apiFetch(__bakney.env.API.SUBSCRIPTION.TAGS.ADD, {
            method: 'POST',
            body: JSON.stringify({
                tag_name: searchTagName,
            }),
        }).then(res => {
            if (res.status == 200) {
                fetchTags();
                toast.success('Tag creato con successo');
            } else {
                toast.error(res.response.msg, 'Errore');
            }
            searchTagName = '';
        });
    }

    async function deleteTag(tag_id) {
        // ask for confirmation before deleting with sweetalert
        swal.fire({
            text: 'Vuoi eliminare il tag?',
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.TAGS.DELETE, tag_id), {
                    method: 'DELETE',
                }).then(res => {
                    visibleMultiaction = false;
                    if (res.status == 200) {
                        fetchTags();
                        toast.success('Tag eliminato con successo');
                        jQuery('#kt_datatable_imported').KTDatatable('reload');
                        jQuery('#kt_datatable').KTDatatable('reload');
                    } else {
                        toast.error(res.response.msg, 'Errore');
                    }
                });
            }
        });
    }

    onMount(() => {
        clearLocalStorageForPartialMatching('kt_datatable_payments_');
        fetchTags();
        jQuery('#expiring_certificate').datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            minDate: moment().format('MM/DD/YYYY'),
            defaultDate: moment().format('MM/DD/YYYY'),
        });

        jQuery('#expiring_certificate').on('change.datetimepicker', function (e) {
            certificate_expring_date = e.date.format('DD/MM/YYYY');
        });
        if ($tablesSettings['members-list']) {
            // loop through tableSettings and update columns
            Object.keys($tablesSettings['members-list']).forEach(key => {
                // find column idx by title
                let idx = columns.findIndex(column => column.title == $tablesSettings['members-list'][key].title);
                // if idx is found
                if (idx != -1) {
                    // update column checked
                    columns[idx].checked = $tablesSettings['members-list'][key].checked;
                }
            });
            visibleColumns = [...columns.filter(column => column.checked || column.title == '' || column.title == '#')];

            // add missing columns with default values
            let defaultColumns = [
                ...columns.filter(column => column.checked || column.title == '' || column.title == '#'),
            ];

            // merge with default if not present in visibleColumns
            visibleColumns = [
                ...visibleColumns,
                ...defaultColumns.filter(column => !visibleColumns.map(x => x.title).includes(column.title)),
            ];
        }
        ktdatable = (function () {
            // Private functions
            var options = {
                // datasource definition
                data: {
                    responsive: false,
                    type: 'remote',
                    source: {
                        read: {
                            url: __bakney.env.HOST + '/subscription/list',
                            method: 'GET',
                            params: $subscriptionListFilterDatatable || {},
                            headers: {
                                Authorization: 'Bearer ' + $sessionToken,
                            },
                            map: function (raw) {
                                // sample data mapping
                                var dataSet = raw;
                                if (typeof raw.data !== 'undefined') {
                                    dataSet = raw.data;
                                }
                                return dataSet;
                            },
                        },
                    },
                    pageSize: 10,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    autoColumns: false, // autocols
                },

                // layout definition
                layout: {
                    scroll: true, // enable/disable datatable scroll both horizontal and
                    footer: false, // display/hide footer
                    spinner: {
                        opacity: 0,
                    },
                },

                toolbar: {
                    items: {
                        pagination: {
                            pageSizeSelect: [10, 20, 30, 50],
                        },
                    },
                },

                // column sorting
                sortable: true,

                pagination: true,

                // columns definition

                columns: visibleColumns,

                // // rows
                rows: {
                    clicked: function (td, obj) {
                        let basicDrawer = new DetailDrawer({
                            target: document.querySelector(`#drawer-elements`),
                            intro: true, // This enables the mount animation
                            props: {
                                subscriptionId: obj.subscription_id,
                                title: `${obj.associate?.first_name || ''} ${obj.associate?.last_name || ''}`,
                            },
                        });
                        basicDrawer.$on('close', () => {
                            // reload datatable
                            ktdatable.reload();
                        });
                    },
                },
            };

            var localSelectorDemo = function () {
                // enable extension
                options.extensions = {
                    // boolean or object (extension options)
                    checkbox: true,
                };

                datatable = jQuery('#kt_datatable').KTDatatable(options);

                datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                    var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                    var count = checkedNodes.length;
                    selectedCounter = count;
                    if (count > 0) {
                        visibleMultiaction = true;
                    } else {
                        visibleMultiaction = false;
                    }
                });

                jQuery('#kt_datatable_fetch_modal')
                    .on('show.bs.modal', function (e) {
                        var ids = datatable
                            .rows('.datatable-row-active')
                            .nodes()
                            .find('.checkbox > [type="checkbox"]')
                            .map(function (i, chk) {
                                return jQuery(chk).val();
                            });
                        var c = document.createDocumentFragment();
                        for (var i = 0; i < ids.length; i++) {
                            var li = document.createElement('li');
                            li.setAttribute('data-id', ids[i]);
                            li.innerHTML = 'Selected record ID: ' + ids[i];
                            c.appendChild(li);
                        }
                        jQuery('#kt_datatable_fetch_display').append(c);
                    })
                    .on('hide.bs.modal', function (e) {
                        jQuery('#kt_datatable_fetch_display').empty();
                    });
            };

            return {
                // public functions
                init: function () {
                    localSelectorDemo();
                },
                search: function (value, key) {
                    datatable.search(value, key);
                },
                setCols: function (cols) {
                    options.columns = cols;
                    // reinit datatable
                    datatable.destroy();
                    localSelectorDemo();
                },
                reload: function () {
                    datatable.reload();
                },
            };
        })();
        ktdatable.init();
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});

        let ktDropzone = new Dropzone('#kt_dropzone', {
            url: uploadMedicalCertificateUrl, // Set the url for your upload script location
            headers: {
                Accept: '*/*',
                Authorization: 'Bearer ' + $sessionToken,
                'Cache-Control': null,
                'X-Requested-With': null,
                Referer: null,
            },
            clickable: true,
            paramName: 'medical_certificate',
            uploadMultiple: false,
            enqueueForUpload: false,
            maxFiles: 1,
            addRemoveLinks: true,
            acceptedFiles: 'image/*,application/pdf',
            maxFilesize: 5, // Max filesize in MB
            dictFallbackMessage: 'Il browser non è supportato.',
            dictDefaultMessage: 'Trascina qui i files.',
            dictFileTooBig: 'Il file è troppo grande: {{filesize}} MB > {{maxFilesize}} MB!',
            dictResponseError: 'Il server ha risposto con ERRORE {{statusCode}}.',
            dictCancelUpload: 'Annulla.',
            dictRemoveFile: 'Rimuovi!',
            dictUploadCanceled: 'Caricamento annullato.',
            dictMaxFilesExceeded: 'È possibile caricare al massimo {{maxFiles}} file.',
            processing: function (file) {
                this.options.url = this.options.url.replace('${subscriptionId}', subscriptionId);
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Caricamento in corso...',
                });
            },
            accept: function (file, done) {
                done();
                uploadedFile = true;
            },
            success: function (file, response) {
                aiSuggestion = false;
                // check if key expiring_date is present in response and not null
                if (response.expiring_date) {
                    // set expiring date from format YYYY-MM-DD to DD/MM/YYYY
                    document.getElementById('expiring_certificate').value = moment(
                        response.expiring_date,
                        'YYYY-MM-DD'
                    ).format('DD/MM/YYYY');
                    certificate_expring_date = moment(response.expiring_date, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    aiSuggestion = true;
                }
                isValid = true;
                KTApp.unblockPage();
            },
            removedfile: function (file) {
                uploadedFile = false;
                file.previewElement.remove();
            },
        });
    });

    onDestroy(() => {
        clearLocalStorageForPartialMatching('kt_datatable_payments_');
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
        document.querySelectorAll('.tooltip').forEach(popover => popover.remove());
    });

    window.acceptSubscription = async (id, skipReload = false, skipToast = false) => {
        let result = {isConfirmed: false};
        if (!skipToast)
            result = await swal.fire({
                text: "Vuoi accettare l'iscrizione?",
                icon: 'question',
                buttonsStyling: true,
                showCancelButton: true,
                cancelButtonText: 'Annulla',
                confirmButtonText: 'Approva',
                reverseButtons: true,
            });
        else result = {isConfirmed: true};
        if (result.isConfirmed) {
            if (!skipToast)
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Approvazione in corso...',
                });

            const url = __bakney.env.HOST + '/subscription/' + id + '/approve';

            let response = await window.fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            });
            response.json();
            // spinner stop
            if (!skipToast) KTApp.unblockPage();
            if (response.status == 200) {
                if (!skipToast) toast.success('Iscrizione Approvata con Successo.');
                if (!skipReload) {
                    jQuery('#kt_datatable').KTDatatable('reload');
                }
            } else {
                let modalText =
                    response.status == 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                if (!skipToast) toast.error(modalText);
            }
            return response;
        }
    };

    async function resubSelected() {
        swal.fire({
            text: `Vuoi reiscrivere ${selectedCounter} soci?`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Reiscrivi selezionati',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Reiscrizione in corso...',
                });
                let results = [];
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        results.push(
                            new Promise(async (resolve, reject) => {
                                let r = await window.renewSubscription(records[id].associate.associate_id, true, true);
                                resolve(r.status == 200);
                            })
                        );
                    }
                }

                Promise.all(results).then(values => {
                    KTApp.unblockPage();
                    visibleMultiaction = false;

                    if (values.length > 0) {
                        if (values.length != selectedCounter) {
                            toast.warning(
                                `${values.length} Associati Reiscritti su ${selectedCounter}.`,
                                'Attenzione!'
                            );
                        } else if (values.every(r => r)) {
                            toast.success(`${values.length} Associati Reiscritti.`);
                        } else {
                            let valid = values.filter(r => r).length;
                            toast.warning(`${valid} Associati Reiscritti su ${selectedCounter}.`);
                        }
                    } else {
                        toast.warning(`Nessun associato reiscritto.`);
                    }
                    jQuery('#kt_datatable').KTDatatable('reload');
                });
            }
        });
    }

    async function approveSelected() {
        swal.fire({
            text: `Vuoi accettare ${selectedCounter} soci?`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Approva selezionati',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Approvazione in corso...',
                });
                let results = [];
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        results.push(
                            new Promise(async (resolve, reject) => {
                                let r = await window.acceptSubscription(records[id].subscription_id, true, true);
                                resolve(r.status == 200);
                            })
                        );
                    }
                }

                Promise.all(results).then(values => {
                    KTApp.unblockPage();
                    visibleMultiaction = false;

                    if (values.length > 0) {
                        if (values.length != selectedCounter) {
                            toast.warning(`${values.length} Associati Approvati su ${selectedCounter}.`);
                        } else if (values.every(r => r)) {
                            toast.success(`${values.length} Associati Approvati.`);
                        } else {
                            let valid = values.filter(r => r).length;
                            toast.warning(`${valid} Associati Approvati su ${selectedCounter}.`);
                        }
                    } else {
                        toast.warning(`Nessun associato approvato.`);
                    }
                    jQuery('#kt_datatable').KTDatatable('reload');
                });
            }
        });
    }

    async function archiveSelected() {
        swal.fire({
            text: `Vuoi archiviare ${selectedCounter} soci?`,
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Archivia selezionati',
            reverseButtons: true,
        }).then(async function (result) {
            if (result.isConfirmed) {
                let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
                let checkedNodes = datatable?.getSelectedRecords();
                let count = checkedNodes.length;
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Archiviazione in corso...',
                });
                let results = [];
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        let id = checkedNodes[i].dataset.row;
                        results.push(
                            new Promise(async (resolve, reject) => {
                                let r = await window.archiveSubscription(records[id].subscription_id, true, true);
                                resolve(r.status == 200);
                            })
                        );
                    }
                }

                Promise.all(results).then(values => {
                    KTApp.unblockPage();
                    visibleMultiaction = false;

                    if (values.length > 0) {
                        if (values.length != selectedCounter) {
                            toast.warning(
                                `${values.length} Associati Archiviati su ${selectedCounter}.`,
                                'Attenzione!'
                            );
                        } else if (values.every(r => r)) {
                            toast.success(`${values.length} Associati Archiviati.`);
                        } else {
                            let valid = values.filter(r => r).length;
                            toast.warning(`${valid} Associati Archiviati su ${selectedCounter}.`);
                        }
                    } else {
                        toast.warning(`Nessun associato archiviato.`);
                    }
                    jQuery('#kt_datatable').KTDatatable('reload');
                });
            }
        });
    }

    async function assignTag() {
        // get the selected tag
        let selectedTags = tags.filter(tag => tag.checked);
        let unassignedTags = tags.filter(tag => !tag.checked);

        // get selected subscriptions rows
        let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
        let checkedNodes = datatable?.getSelectedRecords();
        let count = checkedNodes.length;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Assegnazione tag in corso...',
        });
        let results = [];
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                let id = checkedNodes[i].dataset.row;
                for (let j = 0; j < selectedTags.length; j++) {
                    results.push(
                        new Promise(async (resolve, reject) => {
                            let r = await apiFetch(
                                replaceUID(
                                    replaceUID(
                                        __bakney.env.API.SUBSCRIPTION.TAGS.ASSIGN,
                                        records[id].subscription_id,
                                        '<sub_uid>'
                                    ),
                                    selectedTags[j].tag_id
                                ),
                                {
                                    method: 'PATCH',
                                }
                            );
                            resolve(r.status == 200);
                        })
                    );
                }
                for (let j = 0; j < unassignedTags.length; j++) {
                    results.push(
                        new Promise(async (resolve, reject) => {
                            let r = await apiFetch(
                                replaceUID(
                                    replaceUID(
                                        __bakney.env.API.SUBSCRIPTION.TAGS.UNASSIGN,
                                        records[id].subscription_id,
                                        '<sub_uid>'
                                    ),
                                    unassignedTags[j].tag_id
                                ),
                                {
                                    method: 'PATCH',
                                }
                            );
                            resolve(r.status == 200);
                        })
                    );
                }
            }
        }

        Promise.all(results).then(values => {
            KTApp.unblockPage();
            visibleMultiaction = false;

            if (values.length > 0) {
                if (values.every(r => r)) {
                    toast.success('Tag assegnati con successo');
                } else {
                    toast.warning(`${values.length} Tag assegnati a ${selectedCounter} soci.`);
                }
            } else {
                toast.warning(`Nessun tag assegnato.`);
            }
            jQuery('#kt_datatable').KTDatatable('reload');
        });
    }

    async function transferAccount() {
        let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;
        let checkedNodes = datatable?.getSelectedRecords();
        let count = checkedNodes.length;
        if (count != 1) return toast.warning(`Non hai selezionato nessun tesserato.`);
        let row = records[parseInt(checkedNodes[0].dataset.row)];

        // check if the user is the same of the subscription
        if (row.user.username != $userData.username) {
            return toast.warning(`Non puoi dare accesso ad un iscritto che già ha accesso.`);
        }

        let emailValue = '';
        // get the associate email
        if (row.associate?.email) emailValue = row.associate.email;
        else if (row.associate?.tutor?.email) emailValue = row.associate.tutor.email;
        //<div id="subscription-transfer-modal"></div>
        let htmlSelect = `<input value="${emailValue}" class="form-control form-control-solid mb-2" name="email" id="subscription-receipient" placeholder="inserisci l\'email dell\'utente o il suo username"><br><div class="mb-4">L\'utente avrà 30 giorni di tempo per accettare la richiesta.</div><div id="warning-message"></div>`;
        // searchData?.user?.sport_association?.subscription_fee_plans.forEach(plan => {
        //     htmlSelect += `<option value="${plan.id}">${plan.name} (${plan.subscription_fee}€)</option>`;
        // });
        let emailRegex = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$', 'g');
        let alreadyChecked = false;
        let lastValue = '';
        let user = null;
        let intervalCheckEmail = null;
        let result = await swal.fire({
            title: "Dai accesso all'iscritto con un account " + __bakney.OEM_CONFIG?.name,
            icon: 'info',
            html: htmlSelect,
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: `Dai accesso`,
            reverseButtons: true,
            preConfirm: async value => {
                value = document.getElementById('subscription-receipient').value || null;

                alreadyChecked = value == lastValue;
                if (alreadyChecked) return;

                lastValue = value;

                if (value != null) {
                    const res = await apiFetch(`${__bakney.env.API.OAUTH2.CHECK.EMAIL}?email=${value}&get_user`);
                    if (!res?.response?.valid && res?.response?.exception === 'email already taken.') {
                        user = res?.response?.user;
                        document.getElementById('warning-message').innerHTML = `
                            <div class="alert alert-custom alert-light-info fade show mb-5" role="alert">
                                <div class="alert-icon">
                                    <i class="flaticon-info"></i>
                                </div>
                                <div class="alert-text text-left">
                                    Verrà inviata una richiesta a <b>${res?.response?.user?.first_name} ${res?.response?.user?.last_name}>
                                </div>
                            </div>
                        `;
                        confirmButton.disabled = false;
                        return;

                        // check email is valid in regex
                    } else if (emailRegex.test(value)) {
                        document.getElementById('warning-message').innerHTML = `
                            <div class="alert alert-custom alert-light-warning fade show mb-5" role="alert">
                                <div class="alert-icon">
                                    <i class="flaticon-info"></i>
                                </div>
                                <div class="alert-text text-left">
                                    Verrà creato un account.
                                </div>
                            </div>
                        `;
                        confirmButton.disabled = false;
                        return;
                    }
                }
                document.getElementById('warning-message').innerHTML = `
                    <div class="alert alert-custom alert-light-info fade show mb-5" role="alert">
                        <div class="alert-icon">
                            <i class="flaticon-info"></i>
                        </div>
                        <div class="alert-text text-left">
                            Se non inserisci un'email valida associata ad un utente, questo dovrà registrarsi tramite il <b>link</b> che verrà generato.
                        </div>
                    </div>
                `;
            },
            didRender: async () => {
                let confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.disabled = true;
                intervalCheckEmail = setInterval(async () => {
                    let value = document.getElementById('subscription-receipient').value || null;

                    alreadyChecked = value == lastValue;
                    if (alreadyChecked) return;

                    lastValue = value;

                    if (value != null) {
                        const res = await apiFetch(`${__bakney.env.API.OAUTH2.CHECK.EMAIL}?email=${value}&get_user`);
                        if (!res?.response?.valid && res?.response?.exception === 'email already taken.') {
                            user = res?.response?.user;
                            document.getElementById('warning-message').innerHTML = `
                            <div class="alert alert-custom alert-light-info fade show mb-5" role="alert">
                                <div class="alert-icon">
                                    <i class="flaticon-info"></i>
                                </div>
                                <div class="alert-text text-left">
                                    Verrà inviata una richiesta a <b>${res?.response?.user?.first_name} ${res?.response?.user?.last_name}</b>
                                </div>
                            </div>
                            `;
                            confirmButton.disabled = false;
                            return;
                        } else if (emailRegex.test(value)) {
                            document.getElementById('warning-message').innerHTML = `
                            <div class="alert alert-custom alert-light-warning fade show mb-5" role="alert">
                                <div class="alert-icon">
                                    <i class="flaticon-info"></i>
                                </div>
                                <div class="alert-text text-left">
                                    Verrà creato un account.
                                </div>
                            </div>
                        `;
                            confirmButton.disabled = false;
                            return;
                        }
                    }
                    return;
                }, 500);
            },
            willClose: () => {
                clearInterval(intervalCheckEmail);
            },
        });
        if (result.isConfirmed) {
            const res = await apiFetch(
                replaceUID(__bakney.env.API.SUBSCRIPTION.TRANSFER.TRANSFER, row.subscription_id),
                {
                    method: 'POST',
                    body: JSON.stringify({
                        recipient: user?.user_id,
                        email: document.getElementById('subscription-receipient').value,
                    }),
                }
            );
            if (res.status == 201) {
                toast.success('Invito di accesso creato con successo');
            } else if (res.status == 409) {
                toast.error('Questa iscrizione è già collegata a questo utente', 'Errore');
            } else {
                toast.error(res.response.msg, 'Errore');
            }
        } else {
            return;
        }
    }

    window.rejectSubscription = id => {
        swal.fire({
            text: "Vuoi rifiutare l'iscrizione?",
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Rifiuta',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Azione in corso...',
                });

                const url = __bakney.env.HOST + '/subscription/' + id + '/reject';

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                    })
                    .then(response => {
                        response.json();
                        // spinner stop
                        KTApp.unblockPage();
                        if (response.status == 200) {
                            toast.success('Iscrizione Rifiutata.');
                            jQuery('#kt_datatable').KTDatatable('reload');
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            swal.fire({
                                text: modalText,
                                icon: 'error',
                                buttonsStyling: false,
                                confirmButtonText: 'Ok!',
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light-primary',
                                },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                        }
                    });
            }
        });
    };

    window.archiveSubscription = async (id, skipReload = false, skipToast = false) => {
        let result = {isConfirmed: false};
        if (!skipToast)
            result = await swal.fire({
                text: "Vuoi archiviare l'atleta selezionato?",
                icon: 'question',
                buttonsStyling: true,
                showCancelButton: true,
                cancelButtonText: 'Annulla',
                confirmButtonText: 'Archivia',
                reverseButtons: true,
            });
        else result = {isConfirmed: true};
        if (result.isConfirmed) {
            if (!skipToast)
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Archiviazione in corso...',
                });

            const url = replaceUID(__bakney.env.API.SUBSCRIPTION.ARCHIVE, id);

            let response = await window.fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + $sessionToken,
                },
            });
            response.json();
            // spinner stop
            if (!skipToast) KTApp.unblockPage();
            if (response.status === 200) {
                if (!skipToast) toast.success('Iscrizione archiviata.');
                if (!skipReload) {
                    jQuery('#kt_datatable').KTDatatable('reload');
                }
            } else {
                let modalText =
                    response.status === 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                swal.fire({
                    text: modalText,
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
            return response;
        }
    };

    window.renewSubscription = async (id, skipReload = false, skipToast = false) => {
        let result = {isConfirmed: false};
        if (!skipToast)
            result = await swal.fire({
                text: "Vuoi rinnovare l'iscrizione all'anno corrente?",
                icon: 'question',
                buttonsStyling: true,
                showCancelButton: true,
                cancelButtonText: 'Annulla',
                confirmButtonText: 'Rinnova',
                reverseButtons: true,
            });
        else result = {isConfirmed: true};
        if (result.isConfirmed) {
            if (!skipToast)
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Reiscrizione in corso...',
                });

            const url = `${__bakney.env.API.SUBSCRIPTION.ADD}?m=only_associate`;

            // get info about the subscription
            let records = jQuery('#kt_datatable').KTDatatable('getSelectedRecords').dataSet;

            // loop the records and find the associate
            let record = null;
            for (let i = 0; i < records.length; i++) {
                if (records[i].associate.associate_id == id) {
                    record = records[i];
                    break;
                }
            }

            let body = {
                associate: id,
            };

            // get plan id from meta
            let plan_id = record?.meta?.plan_id;

            // if plan id is not null, add it to the body
            if (plan_id) body.plan_id = plan_id;

            let response = await apiFetch(url, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            // spinner stop
            if (!skipToast) KTApp.unblockPage();
            if (response.status === 200) {
                if (!skipToast) toast.success('Iscrizione Rinnovata.');
                if (!skipReload) {
                    jQuery('#kt_datatable').KTDatatable('reload');
                }
            } else {
                let modalText =
                    response.status === 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                swal.fire({
                    text: modalText,
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok!',
                    customClass: {
                        confirmButton: 'btn font-weight-bold btn-light-primary',
                    },
                }).then(function () {
                    KTUtil.scrollTop();
                });
            }
            return response;
        }
    };

    window.deleteSubscription = id => {
        swal.fire({
            text: "Vuoi eliminare l'iscrizione?",
            icon: 'question',
            buttonsStyling: true,
            showCancelButton: true,
            cancelButtonText: 'Annulla',
            confirmButtonText: 'Elimina',
            reverseButtons: true,
        }).then(function (result) {
            if (result.isConfirmed) {
                KTApp.blockPage({
                    overlayColor: '#000000',
                    state: 'primary',
                    message: 'Eliminazione in corso...',
                });

                const url = replaceUID(__bakney.env.API.SUBSCRIPTION.DELETE, id);

                window
                    .fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                    })
                    .then(response => {
                        response.json();
                        // spinner stop
                        KTApp.unblockPage();
                        if (response.status == 200) {
                            toast.success('Iscrizione Eliminata.');
                            jQuery('#kt_datatable').KTDatatable('reload');
                        } else {
                            let modalText =
                                response.status == 403
                                    ? 'Operazione non permessa.'
                                    : 'Scusa, ho individuato degli errori, riprova.';
                            swal.fire({
                                text: modalText,
                                icon: 'error',
                                buttonsStyling: false,
                                confirmButtonText: 'Ok!',
                                customClass: {
                                    confirmButton: 'btn font-weight-bold btn-light-primary',
                                },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                        }
                    });
            }
        });
    };

    window.openDetail = function (url) {
        push(url);
    };

    const updateMedicalCertificate = function () {
        jQuery('#kt_datatable').KTDatatable('reload');
        Dropzone.forElement('#kt_dropzone').removeAllFiles();

        toast.success('Certificato Medico Aggiornato con Successo.');
    };

    const uploadMedicalCertificateUrl =
        __bakney.env.HOST + '/subscription/${subscriptionId}/medical-certificate/upload';

    function exportDataFile(filetype, simplified = false) {
        // show loading
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Esportazione in corso...',
        });
        // assign content type for automatic download
        const contentType = filetype == 'csv' ? 'text/csv' : 'application/vnd.ms-excel';

        // fetching the API by providing the required format
        apiFetch(`${__bakney.env.API.SUBSCRIPTION.EXPORT}?filetype=${filetype}&simplified=${simplified}`)
            .then(res => {
                window.downloadFile(res.response.data.filename, res.response.data.file, contentType);
            })
            .finally(() => {
                // hide loading
                KTApp.unblockPage();
            });
    }

    async function setCertificateExpiration() {
        await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.MEDICAL_CERTIFICATE.SET_CERTIFICATE_EXPIRATION, subscriptionId),
            {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: subscriptionId,
                    certificate_expiring_date: certificate_expring_date,
                }),
            }
        );
        aiSuggestion = false;
    }
</script>

<!-- Modal-->
<div
    class="modal fade"
    id="uploadMedicalCertificateModal"
    style="padding:0!important"
    data-backdrop="static"
    tabindex="-1"
    role="dialog"
    aria-labelledby="staticBackdrop"
    aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Certificato Medico</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close" />
                </button>
            </div>
            <div class="modal-body">
                <div class="dropzone dropzone-default" id="kt_dropzone">
                    <div class="dropzone-msg dz-message needsclick">
                        <h3 class="dropzone-msg-title">Trascina o premi per caricare il Certificato Medico.</h3>
                        <span class="dropzone-msg-desc"
                            >Sono supportati file <b>pdf</b> e <b>immagini</b> di grandezza inferiore a
                            <b>5MB</b>.</span>
                    </div>
                </div>
                <div class="col-xl-12 ml-0 pl-0 pt-8">
                    <div class="form-group">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label>Data di scadenza<b>*</b></label>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div
                            class="input-group input-group-solid date"
                            on:click={() => (aiSuggestion = false)}
                            data-target-input="nearest">
                            <input
                                bind:value={certificate_expring_date}
                                id="expiring_certificate"
                                name="bornDateAssociate"
                                type="text"
                                class="form-control form-control-solid form-control-lg datetimepicker-input"
                                placeholder="Seleziona Data"
                                data-target="#expiring_certificate" />
                            <div
                                class="input-group-append"
                                data-target="#expiring_certificate"
                                data-toggle="datetimepicker">
                                <span class="input-group-text">
                                    <i class="ki ki-calendar" />
                                </span>
                            </div>
                        </div>
                    </div>
                    {#if aiSuggestion}
                        <!-- alert -->
                        <div
                            class="d-flex align-items-center text-bold text-warning bg-light-warning p-4 mb-4"
                            style="border-radius: 0.35rem;">
                            <Warning size={18} weight="duotone" class="mr-2" />
                            La data di scadenza è stata suggerita automaticamente dal sistema.
                        </div>
                    {/if}
                    <div class="col-12 d-flex justify-content-start align-items-center">
                        <small class="text-muted font-size-sm lh-xs">
                            Verrà inviata una mail all'utente e all'associazione per notificare la scadenza del
                            certificato.
                        </small>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                    >Chiudi</button>
                <button
                    disabled={!isValid}
                    data-dismiss="modal"
                    type="button"
                    class="btn btn-primary font-weight-bold"
                    on:click|preventDefault={async () => {
                        await setCertificateExpiration();
                        updateMedicalCertificate();
                    }}>Salva</button>
            </div>
        </div>
    </div>
</div>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="d-block d-md-flex justify-content-between">
                <NavigationTab />
                <ExportData />
            </div>
            <div class="card-header p-0 flex-wrap border-0">
                <div class="card-title">
                    <h1 class="card-label font-size-h1 font-weight-bolder">
                        Tesserati
                        <span class="d-block text-muted pt-2 font-size-sm">Tesserati e soci tesserati.</span>
                    </h1>
                </div>
                <div class="card-toolbar">
                    <!--begin::Button-->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <a
                        class="btn btn-light-warning font-weight-boldest m-2 d-flex align-items-center"
                        on:click={() => {
                            let modal = new ShareModulePresubscriptionLink({
                                target: document.body,
                                props: {
                                    show: true,
                                },
                            });
                        }}>
                        <Link size="19" weight="duotone" class="mr-0 mr-md-2" />
                        Condividi link pre-iscrizioni
                    </a>
                    <!--begin::Button-->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <a
                        class="btn btn-light-primary font-weight-boldest m-2 d-flex align-items-center"
                        on:click={() => {
                            let modal = new ShareModuleSubscriptionLink({
                                target: document.body,
                                props: {
                                    show: true,
                                },
                            });
                        }}>
                        <ShareNetwork size="19" weight="duotone" class="mr-0 mr-md-2" />
                        Condividi link iscrizioni
                    </a>
                    <!--end::Button-->
                    <!--begin::Button-->
                    {#if canPerformAction('association.members.create')}
                        <a
                            href="/#/members/add"
                            class="btn btn-primary font-weight-boldest d-flex align-items-center m-2">
                            <UserCirclePlus size="19" weight="duotone" class="mr-0 mr-md-2" />
                            Aggiungi
                        </a>
                    {/if}
                    <!--end::Button-->
                </div>
            </div>
            <div class="card-body p-0">
                <!--begin: Search Form-->
                <!--begin::Search Form-->
                <div class="mb-2">
                    <div class="row align-items-center">
                        <div class="col-12 mx-0 mx-md-2">
                            <div class="row align-items-center justify-content-between">
                                <div
                                    class="col-12 col-md-auto p-0 m-0 d-flex flex-column flex-md-row align-items-center justify-content-start">
                                    <div class="col-md-5 col-12 my-2 my-md-0 p-0 px-md-2">
                                        <div class="input-icon d-flex">
                                            <input
                                                type="text"
                                                bind:value={$subscriptionListFilter.generalSearch}
                                                on:keyup={debounce(() => {
                                                    datatable?.setDataSourceParams($subscriptionListFilterDatatable);
                                                }, 300)}
                                                class="form-control form-control-solid mb-0 {$subscriptionListFilter.generalSearch !=
                                                ''
                                                    ? 'border border-secondary border-2 bg-light'
                                                    : 'border border-secondary border-dashed bg-white'}"
                                                placeholder="Cerca..."
                                                id="kt_datatable_search_query" />
                                            <span>
                                                <i class="flaticon2-search-1 text-muted" />
                                            </span>

                                            <button
                                                style="position: absolute;right:0;"
                                                class="btn btn-icon btn-ghost mb-0"
                                                class:d-none={$subscriptionListFilter.generalSearch == ''}
                                                on:click={() => {
                                                    $subscriptionListFilter.generalSearch = '';
                                                    datatable?.setDataSourceParams($subscriptionListFilterDatatable);
                                                }}>
                                                <XCircleIcon size={19} weight="duotone" />
                                            </button>
                                        </div>
                                    </div>
                                    {#if $userData.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !== undefined}
                                        <div class="col-12 col-md-auto my-2 px-0 mx-0 mx-md-2">
                                            <div class="form-group mb-0">
                                                <SmartSelect
                                                    customClasses={'m-0 p-0 w-xs filter-select'}
                                                    selectClasses={$subscriptionListFilter.prefix != ''
                                                        ? 'query-filter-select border border-secondary border-2 bg-light'
                                                        : 'query-filter-select border border-secondary border-dashed bg-white'}
                                                    editable={false}
                                                    active={false}
                                                    bind:value={$subscriptionListFilter.prefix}
                                                    on:change={() => {
                                                        datatable?.setDataSourceParams(
                                                            $subscriptionListFilterDatatable
                                                        );
                                                    }}
                                                    props={{
                                                        id: 'kt_datatable_search_school',
                                                        name: 'school_name',
                                                        label: null,
                                                        placeholder: 'Cerca per palestra',
                                                        required: true,
                                                        clearable: false,
                                                        showChevron: true,
                                                        options: [
                                                            {label: 'Cerca tutto', value: ''},
                                                            {label: 'Cerca per palestra', value: '"school_name": "'},
                                                        ],
                                                        value: $subscriptionListFilter.prefix,
                                                    }} />
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-auto my-2 px-0 mx-0 mx-md-2">
                                            <div class="form-group mb-0">
                                                <SmartSelect
                                                    customClasses={'m-0 p-0 w-xs filter-select'}
                                                    selectClasses={$subscriptionListFilter.type_of_associate != ''
                                                        ? 'query-filter-select border border-secondary border-2 bg-light'
                                                        : 'query-filter-select border border-secondary border-dashed bg-white'}
                                                    editable={false}
                                                    active={false}
                                                    bind:value={$subscriptionListFilter.type_of_associate}
                                                    on:change={() => {
                                                        datatable?.setDataSourceParams(
                                                            $subscriptionListFilterDatatable
                                                        );
                                                    }}
                                                    props={{
                                                        id: 'kt_datatable_search_type_of_associate',
                                                        name: 'type_of_associate',
                                                        label: null,
                                                        placeholder: 'Sono un/una',
                                                        required: true,
                                                        clearable: false,
                                                        showChevron: true,
                                                        options: [
                                                            {label: 'Sono un/una', value: ''},
                                                            ...typesOfAssociates.map(type => ({
                                                                label: type.label,
                                                                value: `"type_of_associate": "${type.value}"`,
                                                            })),
                                                        ],
                                                        value: $subscriptionListFilter.type_of_associate,
                                                    }} />
                                            </div>
                                        </div>
                                    {/if}
                                    <div class="col-12 col-md-auto my-2 px-0 mx-0 mx-md-1">
                                        <SmartSelect
                                            customClasses={'m-0 p-0 filter-select'}
                                            selectClasses={$subscriptionListFilter.status != ''
                                                ? 'query-filter-select border border-secondary border-2 bg-light'
                                                : 'query-filter-select border border-secondary border-dashed bg-white'}
                                            editable={false}
                                            active={false}
                                            on:change={() => {
                                                datatable?.setDataSourceParams($subscriptionListFilterDatatable);
                                            }}
                                            bind:value={$subscriptionListFilter.status}
                                            props={{
                                                id: 'search_status',
                                                name: 'status',
                                                label: null,
                                                placeholder: 'Filtra stato',
                                                required: true,
                                                clearable: false,
                                                showChevron: true,
                                                options: [
                                                    {label: 'Filtra stato', value: ''},
                                                    {label: 'Non firmata', value: '1'},
                                                    {label: 'In attesa', value: '2'},
                                                    {label: 'Rifiutata', value: '3'},
                                                    {label: 'Accettata', value: '4'},
                                                    {label: 'Ritirata', value: '5'},
                                                ],
                                                value: $subscriptionListFilter.status,
                                            }} />
                                    </div>
                                    <div class="col-12 col-md-auto my-2 mx-md-1 px-0">
                                        <SmartSelect
                                            customClasses={'m-0 p-0 filter-select'}
                                            selectClasses={$subscriptionListFilter.year != '-'
                                                ? 'query-filter-select border border-secondary border-2 bg-light'
                                                : 'query-filter-select border border-secondary border-dashed bg-white'}
                                            editable={false}
                                            active={false}
                                            bind:value={$subscriptionListFilter.year}
                                            on:change={() => {
                                                datatable?.setDataSourceParams($subscriptionListFilterDatatable);
                                            }}
                                            props={{
                                                id: 'show_current',
                                                name: 'show_current',
                                                label: null,
                                                placeholder: "Seleziona un tipo di iscrizione per l'atleta",
                                                required: true,
                                                clearable: false,
                                                showChevron: true,
                                                options: [
                                                    {label: 'Filtra Anno', value: '-'},
                                                    {label: 'Anno corrente', value: '1'},
                                                    {label: 'Anni precedenti', value: '0'},
                                                    {label: 'Pre-iscrizioni', value: '2'},
                                                ],
                                                value: $subscriptionListFilter.year,
                                            }} />
                                    </div>
                                    <div class="col-12 col-md-auto my-2 mx-md-1 px-0">
                                        <div class="dropdown dropdown-inline m-0">
                                            <button
                                                type="button"
                                                class="btn btn-light {Object.values(
                                                    $subscriptionListFilter.filter
                                                ).some(x => x)
                                                    ? 'border-secondary border-2 bg-light'
                                                    : 'border-secondary border-dashed bg-white'} btn-icon m-0"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false">
                                                <Funnel size="18" weight="duotone" class="text-secondary" />
                                            </button>
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                                            <div
                                                class="dropdown-menu rounded-xl py-0"
                                                on:click|preventDefault={() => {
                                                    datatable?.setDataSourceParams($subscriptionListFilterDatatable);
                                                }}>
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <form class="p-0">
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filterHideAssociateMembers = document.querySelector(
                                                                'input[name="filter_hide_associate_and_members"]'
                                                            );
                                                            filterHideAssociateMembers.checked =
                                                                !filterHideAssociateMembers.checked;
                                                            $subscriptionListFilter.filter.hide_associate_and_members =
                                                                filterHideAssociateMembers.checked;
                                                        }}>
                                                        <!-- svelte-ignore missing-declaration -->
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .hide_associate_and_members}
                                                                name="filter_hide_associate_and_members" />
                                                            <span />
                                                            <content class="ml-4"> Nascondi Soci Tesserati </content>
                                                        </label>
                                                    </span>
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filterHideMembers = document.querySelector(
                                                                'input[name="filter_hide_members"]'
                                                            );
                                                            filterHideMembers.checked = !filterHideMembers.checked;
                                                            $subscriptionListFilter.filter.hide_members =
                                                                filterHideMembers.checked;
                                                        }}>
                                                        <!-- svelte-ignore missing-declaration -->
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .hide_members}
                                                                name="filter_hide_members" />
                                                            <span />
                                                            <content class="ml-4"> Nascondi tesserati </content>
                                                        </label>
                                                    </span>
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filter1 =
                                                                document.querySelector('input[name="filter1"]');
                                                            filter1.checked = !filter1.checked;
                                                            $subscriptionListFilter.filter.certificate_missing_flag =
                                                                filter1.checked;
                                                        }}>
                                                        <!-- svelte-ignore missing-declaration -->
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .certificate_missing_flag}
                                                                name="filter1" />
                                                            <span />
                                                            <content class="ml-4"> Certificato non presente </content>
                                                        </label>
                                                    </span>
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filter2 =
                                                                document.querySelector('input[name="filter2"]');
                                                            filter2.checked = !filter2.checked;
                                                            $subscriptionListFilter.filter.certificate_expired_flag =
                                                                filter2.checked;
                                                        }}>
                                                        <!-- svelte-ignore missing-declaration -->
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                name="filter2"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .certificate_expired_flag} />
                                                            <span />
                                                            <content class="ml-4"> Certificato scaduto </content>
                                                        </label>
                                                    </span>
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filter3 =
                                                                document.querySelector('input[name="filter3"]');
                                                            filter3.checked = !filter3.checked;
                                                            $subscriptionListFilter.filter.subscription_not_paid_flag =
                                                                filter3.checked;
                                                        }}>
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .subscription_not_paid_flag}
                                                                name="filter3" />
                                                            <span />
                                                            <content class="ml-4"> Iscrizione non pagata </content>
                                                        </label>
                                                    </span>
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filter4 =
                                                                document.querySelector('input[name="filter4"]');
                                                            filter4.checked = !filter4.checked;
                                                            // if active disable
                                                            $subscriptionListFilter.filter.sort_lastname_asc_flag =
                                                                $subscriptionListFilter.filter.sort_lastname_asc_flag
                                                                    ? !filter4.checked
                                                                    : false;
                                                            $subscriptionListFilter.filter.sort_lastname_asc_flag =
                                                                filter4.checked;
                                                        }}>
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .sort_lastname_asc_flag}
                                                                name="filter4" />
                                                            <span />
                                                            <content class="ml-4"> Ordina per cognome A-Z </content>
                                                        </label>
                                                    </span>
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <span
                                                        class="dropdown-item"
                                                        on:click|preventDefault={() => {
                                                            let filter5 =
                                                                document.querySelector('input[name="filter5"]');
                                                            filter5.checked = !filter5.checked;
                                                            // if active disable
                                                            $subscriptionListFilter.filter.sort_lastname_desc_flag =
                                                                $subscriptionListFilter.filter.sort_lastname_desc_flag
                                                                    ? !filter5.checked
                                                                    : false;
                                                            $subscriptionListFilter.filter.sort_lastname_desc_flag =
                                                                filter5.checked;
                                                        }}>
                                                        <label class="checkbox">
                                                            <input
                                                                type="checkbox"
                                                                bind:checked={$subscriptionListFilter.filter
                                                                    .sort_lastname_desc_flag}
                                                                name="filter5" />
                                                            <span />
                                                            <content class="ml-4"> Ordina per cognome Z-A </content>
                                                        </label>
                                                    </span>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="col-12 col-md-auto p-0 text-right text-md-left p-md-auto m-0 mx-md-1 my-2 my-md-0">
                                        <QueryFilter
                                            {filters}
                                            showMore={false}
                                            on:filter-applied={handleFilterApplied} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 d-flex justify-content-end align-items-center mb-2">
                    <div class="my-2 mr-1">
                        <div class="dropdown">
                            <button
                                class="btn btn-sm btn-light-primary dropdown-toggle font-weight-bolder d-flex align-items-center"
                                type="button"
                                id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <FileArrowDown size={14} weight="duotone" class="mr-2" />
                                Stampe utili
                            </button>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="dropdown-menu rounded-xl py-0" aria-labelledby="dropdownMenuButton">
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'expiring_medical_certificates',
                                                title: `Stampa certificati medici in scadenza`,
                                            },
                                        });
                                    }}>
                                    <FirstAidKit size={18} weight="duotone" class="mr-2 text-success" />
                                    <div class="d-flex flex-column">
                                        Certificati medici in scadenza
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >entro 30gg</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'expired_medical_certificates',
                                                title: `Stampa certificati medici scaduti`,
                                            },
                                        });
                                    }}>
                                    <FirstAidKit size={18} weight="duotone" class="mr-2 text-success" />
                                    <div class="d-flex flex-column">
                                        Certificati medici scaduti
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >tutte le iscrizioni con certificato scaduto</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'empty_medical_certificates',
                                                title: `Stampa atleti senza certificato medico (esclusi esenti)`,
                                            },
                                        });
                                    }}>
                                    <FirstAidKit size={18} weight="duotone" class="mr-2 text-success" />
                                    <div class="d-flex flex-column">
                                        Certificati medici non presenti
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >solo per atleti non esenti</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'exempt_medical_certificates',
                                                title: `Stampa atleti esenti dal certificato medico`,
                                            },
                                        });
                                    }}>
                                    <FirstAidKit size={18} weight="duotone" class="mr-2 text-success" />
                                    <div class="d-flex flex-column">
                                        Atleti esenti dal certificato medico
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >atleti minori di 6 anni</span>
                                    </div>
                                </a>
                                <hr class="py-0 my-0 mx-4 border-light" />
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'not_paid_quotes_subscriptions',
                                                title: `Stampa atleti con quote associative non pagate`,
                                            },
                                        });
                                    }}>
                                    <Coins size={18} weight="duotone" class="mr-2 text-warning" />
                                    <div class="d-flex flex-column">
                                        Quote iscrizioni non pagate
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >quote associative non ancora pagate</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'not_paid_courses_subscriptions',
                                                title: `Stampa atleti con quote corsi non pagate`,
                                            },
                                        });
                                    }}>
                                    <Coins size={18} weight="duotone" class="mr-2 text-warning" />
                                    <div class="d-flex flex-column">
                                        Quote corsi non pagate
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >quote corsi non ancora pagate ad oggi</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'expired_payments',
                                                title: `Stampa atleti con pagamenti scaduti`,
                                            },
                                        });
                                    }}>
                                    <Coins size={18} weight="duotone" class="mr-2 text-warning" />
                                    <div class="d-flex flex-column">
                                        Pagamenti scaduti
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >Pagamenti scaduti</span>
                                    </div>
                                </a>
                                <hr class="py-0 my-0 mx-4 border-light" />
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'expiring_subscriptions',
                                                title: `Stampa iscrizioni in scadenza`,
                                            },
                                        });
                                    }}>
                                    <Users size={18} weight="duotone" class="mr-2 text-primary" />
                                    <div class="d-flex flex-column">
                                        Iscrizioni in scadenza
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >entro 30gg</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'expiring_memberships',
                                                title: `Stampa tesseramenti in scadenza e scaduti`,
                                            },
                                        });
                                    }}>
                                    <Users size={18} weight="duotone" class="mr-2 text-primary" />
                                    <div class="d-flex flex-column">
                                        Tesseramenti in scadenza o scaduti
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >entro 30gg o scaduti</span>
                                    </div>
                                </a>
                                <a
                                    class="dropdown-item font-weight-bolder align-items-center"
                                    on:click={() => {
                                        // implement the PrintingModal
                                        let printingModal = new PrintingModal({
                                            target: document.querySelector(`#portal-elements`),
                                            intro: true,
                                            props: {
                                                type: 'all_subscriptions',
                                                title: `Stampa libro soci`,
                                            },
                                        });
                                    }}>
                                    <Users size={18} weight="duotone" class="mr-2 text-primary" />
                                    <div class="d-flex flex-column">
                                        Tutte le iscrizioni
                                        <span class="text-dark-75 font-weight-normal" style="font-size:0.9rem"
                                            >iscrizioni approvate</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="my-2 mr-1">
                        <button
                            class="btn btn-sm btn-light-primary font-weight-bolder m-0"
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title="Esporta ricerca corrente in Excel o PDF"
                            on:click={() => {
                                let query = $subscriptionListFilterDatatable;
                                // transform query to be a string like ?query[key]=value&...
                                let queryString = Object.keys(query)
                                    .map(key => {
                                        return `${key}` + '=' + query[key];
                                    })
                                    .join('&');

                                // sort options
                                let sort = datatable.getDataSourceParam('sort');
                                if (sort) {
                                    queryString += '&sort[field]=' + sort.field + '&sort[sort]=' + sort.sort;
                                }

                                // add type=athletes
                                queryString += '&type=athletes';

                                let endpointWithQueryString = __bakney.env.API.SUBSCRIPTION.LIST + '?' + queryString;
                                let printingModal = new CurrentViewPrintingModal({
                                    target: document.querySelector(`#portal-elements`),
                                    intro: true,
                                    props: {
                                        title: `Stampa vista corrente`,
                                        endpointWithQueryString: endpointWithQueryString,
                                    },
                                });
                            }}>
                            <Printer size={14} weight="duotone" class="mr-1" />
                            Vista corrente
                        </button>
                    </div>
                    <div class="m-0 my-2 my-md-0">
                        <div class="dropdown dropleft m-0">
                            <button
                                type="button"
                                class="btn btn-sm btn-light-primary btn-icon m-0"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <SlidersHorizontal
                                    size={18}
                                    weight="bold"
                                    data-toggle="tooltip"
                                    data-placement="bottom"
                                    title="Mostra / nascondi colonne tabella" />
                            </button>
                            <div class="dropdown-menu">
                                <form class="p-0">
                                    {#each Array.from(columns || []) as col, idx}
                                        {#if col.title != '' && col.title != '#'}
                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                                            <span
                                                class="dropdown-item"
                                                on:click|preventDefault={() => {
                                                    columns[idx].checked = !columns[idx].checked;
                                                    visibleColumns = [
                                                        ...columns.filter(
                                                            x => x.checked || x.title == '' || x.title == '#'
                                                        ),
                                                    ];
                                                    ktdatable.setCols(visibleColumns);

                                                    updateTableSettings(
                                                        columns.map(x => {
                                                            return {
                                                                title: x.title,
                                                                checked: x.checked,
                                                            };
                                                        }),
                                                        'members-list'
                                                    );
                                                }}>
                                                <label class="checkbox">
                                                    <input
                                                        type="checkbox"
                                                        name="filter1"
                                                        bind:checked={columns[idx].checked} />
                                                    <span />
                                                    <content class="ml-4"> {col.title} </content>
                                                </label>
                                            </span>
                                        {/if}
                                    {/each}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Search Form-->
                <!--end: Search Form-->
                <!--begin: Selected Rows Group Action Form-->
                {#if visibleMultiaction}
                    <div in:slide={{duration: 100}} class="mt-10 mb-5" id="kt_datatable_group_action_form">
                        <div class="d-flex align-items-center">
                            <div class="font-weight-boldest mr-3 ml-2" style="font-size:1.1rem;">
                                {selectedCounter} selezionati
                            </div>
                            <button
                                disabled={!canPerformAction('association.members.update')}
                                on:click={approveSelected}
                                class="btn btn-sm btn-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                type="button"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Approva le iscrizioni selezionate"
                                id="kt_datatable_approve_selected">
                                <CheckCircle size="17" weight="duotone" class="mr-1" />

                                <span class="d-none d-md-block">Approva</span></button>
                            <button
                                disabled={!canPerformAction('association.members.update')}
                                on:click={archiveSelected}
                                class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                type="button"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Archivia le iscrizioni selezionate anche se nell'anno corrente"
                                id="kt_datatable_archive_selected">
                                <ArchiveBox size="17" weight="duotone" class="mr-1" />
                                <span class="d-none d-md-block">Archivia</span></button>
                            <button
                                disabled={!canPerformAction('association.members.update')}
                                class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-centerdropdown-toggle"
                                type="button"
                                on:click={() => {
                                    searchTagName = '';
                                    tags = tags.map(x => {
                                        x.checked = false;
                                        return x;
                                    });
                                }}
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                                id="kt_datatable_assign_tag_to_selected">
                                <Tag size="17" weight="duotone" class="mr-1" />
                                <span class="d-none d-md-block">Assegna Tag</span></button>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div
                                on:click={e => e.stopPropagation()}
                                class="dropdown-menu dropdown-menu-lg p-1 m-0"
                                style="box-shadow: #00000012 0px 1rem 1rem 0;width:20rem;">
                                <div class="form-group mb-0">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <div class="input-group">
                                        <input
                                            bind:value={searchTagName}
                                            type="text"
                                            on:focus={e => {
                                                // remove outline css on focus
                                                e.target.style.outline = 'none';
                                                // set border radius to .35rem
                                                e.target.style.borderRadius = '.35rem';
                                            }}
                                            class="form-control form-control-sm form-control-solid"
                                            placeholder="Nome tag..." />
                                        <div class="input-group-append">
                                            <button
                                                on:click={() => {
                                                    createTag();
                                                }}
                                                disabled={Array.from(tags).filter(
                                                    x =>
                                                        x.tag_name
                                                            .toUpperCase()
                                                            .includes(searchTagName.toUpperCase()) ||
                                                        searchTagName == ''
                                                ).length != 0}
                                                class="btn btn-sm btn-primary font-weight-bold"
                                                type="button"><PlusCircle weight="duotone" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="" style="max-height: 12rem; overflow-y: auto;">
                                    <!-- Empty state -->
                                    {#if Array.from(tags).filter(x => x.tag_name
                                                .toUpperCase()
                                                .includes(searchTagName.toUpperCase()) || searchTagName == '').length == 0}
                                        <span class="dropdown-item rounded p-2 d-flex justify-content-between">
                                            <!-- svelte-ignore a11y-label-has-associated-control -->
                                            <label class="checkbox w-100">
                                                <content class="ml-4" for="tag-empty">Nessun tag trovato</content>
                                            </label>
                                        </span>
                                    {/if}
                                    {#each Array.from(tags).filter(x => x.tag_name
                                                .toUpperCase()
                                                .includes(searchTagName.toUpperCase()) || searchTagName == '') as tag}
                                        <span class="dropdown-item rounded p-2 d-flex justify-content-between">
                                            <label class="checkbox w-100">
                                                <input
                                                    type="checkbox"
                                                    bind:checked={tag.checked}
                                                    id="tag-{tag.tag_id}" />
                                                <span />
                                                <content class="ml-4" for="tag-{tag.tag_id}">{tag.tag_name}</content>
                                            </label>
                                            <span
                                                on:click={() => {
                                                    deleteTag(tag.tag_id);
                                                }}>
                                                <TrashSimple size="17" weight="duotone" class="ml-2 text-danger" />
                                            </span>
                                        </span>
                                    {/each}
                                </div>
                                <div>
                                    <button
                                        class="btn btn-sm btn-primary w-100 font-weight-bolder m-0 mt-2 d-flex align-items-center justify-content-center"
                                        type="button"
                                        on:click={() => {
                                            assignTag();
                                        }}
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="Assegna i tag selezionati ai soci selezionati">
                                        APPLICA</button>
                                </div>
                            </div>
                            <button
                                disabled={selectedCounter != 1 || !canPerformAction('association.members.update')}
                                on:click={transferAccount}
                                class="btn btn-sm btn-light-primary font-weight-bolder m-0 ml-2 p-2 d-flex align-items-center"
                                type="button"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Dai accesso all'iscritto con un account {__bakney.OEM_CONFIG?.name}"
                                id="kt_datatable_transfer_selected">
                                <UserSwitch size="17" weight="duotone" class="mr-1" />
                                <span class="d-none d-md-block">Dai accesso</span></button>
                        </div>
                    </div>
                {/if}
                <!--end: Selected Rows Group Action Form-->
                <!--begin: Datatable-->
                <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable" />
                <!--end: Datatable-->
            </div>
        </div>
        <!--end::Card-->
        <!--begin::Modal-->
        <div
            class="modal fade"
            id="kt_datatable_fetch_modal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Selected Records</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="scroll" data-scroll="true" data-height="200">
                            <ul id="kt_datatable_fetch_display" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Close</button>
                    </div>
                </div>
            </div>
        </div>
        <!--end::Modal-->
    </div>
    <!--end::Container-->
</div>
