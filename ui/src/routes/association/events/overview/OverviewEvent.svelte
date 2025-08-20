<script>
    import {sessionToken, userData} from 'store/stores.js';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {onMount, onDestroy} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {EURcurrency, waitForElementAndExecute} from 'utils/Functions.js';
    import DeleteButton from 'components/buttons/DeleteButton.svelte';
    import {toast} from 'svelte-sonner';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params;

    let row;

    let ktdatable = (function () {
        // Private functions
        var datatable;

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: replaceUID(__bakney.env.API.EVENT.SUBSCRIPTION.LIST, params.id),
                        method: 'GET',
                        params: {
                            // API params
                        },
                        headers: {
                            Authorization: 'Bearer ' + $sessionToken,
                        },
                        map: function (raw) {
                            var dataSet = raw;
                            if (typeof raw.data !== 'undefined') {
                                dataSet = raw.data;
                            }
                            return dataSet;
                        },
                    },
                },
                pageSize: 10,
                serverPaging: false,
                serverFiltering: false,
                serverSorting: false,
                autoColumns: false, // autocols
            },

            // layout definition
            layout: {
                scroll: true, // enable/disable datatable scroll both horizontal and
                footer: false, // display/hide footer
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

            search: {
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [
                {
                    field: 'associate',
                    title: 'Atleta',
                    sortable: true,
                    autoHide: false,
                    width: 135,
                    template: function (row) {
                        return (
                            `<span class="text-dark-75 font-weight-bolder mb-0">` +
                            row.payment.associate.first_name +
                            ' ' +
                            row.payment.associate.last_name +
                            '</span>'
                        );
                    },
                },
                {
                    field: 'payment_date',
                    title: 'Pagato il',
                    width: 80,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortable: true,
                    template: function (row) {
                        return row.payment.payment_date
                            ? moment(new Date(row.payment.payment_date)).format('DD/MM/YYYY')
                            : '-';
                    },
                },
                {
                    field: 'status',
                    title: 'Stato',
                    width: 100,
                    responsive: {
                        visible: 'lg',
                        hidden: 'md',
                    },
                    sortable: true,
                    template: function (row) {
                        return row.payment.paid
                            ? '<span class="label label-light-success label-inline font-weight-bolder label-lg">Pagato</span>'
                            : '<span class="label label-light-danger label-inline font-weight-bolder label-lg">Non Pagato</span>';
                    },
                },
                {
                    field: '',
                    title: '',
                    sortable: false,
                    textAlign: 'right',
                    autoHide: false,
                    width: 100,
                    minWidth: '100%',
                    template: function (row) {
                        waitForElementAndExecute(`#action-col-${row.event_subscription_id}`, () => {
                            if (document.querySelector(`#action-col-${row.event_subscription_id}`))
                                document.querySelector(`#action-col-${row.event_subscription_id}`).innerHTML = '';

                            let deleteBtn = new DeleteButton({
                                target: document.querySelector(`#action-col-${row.event_subscription_id}`),
                                intro: true,
                                props: {
                                    disabled: row.payment.paid,
                                },
                            });

                            deleteBtn.$on('open', data => {
                                swal.fire({
                                    text: "Vuoi eliminare l'iscrizione all'evento?",
                                    icon: 'warning',
                                    buttonsStyling: true,
                                    showCancelButton: true,
                                    cancelButtonText: 'Annulla',
                                    confirmButtonText: 'Elimina',
                                    reverseButtons: true,
                                    confirmButtonColor: '#d63030',
                                }).then(async function (result) {
                                    if (result.isConfirmed) {
                                        KTApp.blockPage({
                                            overlayColor: '#000000',
                                            state: 'primary',
                                            message: 'Eliminazione in corso...',
                                        });

                                        const response = await apiFetch(
                                            replaceUID(
                                                replaceUID(__bakney.env.API.EVENT.SUBSCRIPTION.DELETE, params.id),
                                                row.event_subscription_id,
                                                '<sub_uid>'
                                            ),
                                            {
                                                method: 'DELETE',
                                            }
                                        );

                                        KTApp.unblockPage();

                                        if (!response.error) {
                                            ktdatable.reload();
                                            toast.success("Iscrizione all'evento eliminata!");
                                        } else {
                                            toast.error('Qualcosa è andato storto.');
                                        }
                                    }
                                });
                            });
                        });
                        return `<div id="action-col-${row.event_subscription_id}" class="action-column pr-4"></div>`;
                    },
                },
            ],
        };

        // basic demo
        var localSelectorDemo = function () {
            // enable extension
            options.extensions = {
                // boolean or object (extension options)
                checkbox: true,
            };

            options.search = {
                input: jQuery('#kt_datatable_search_query'),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery('#kt_datatable').KTDatatable(options);

            jQuery('#kt_datatable_search_status').on('change', function () {
                datatable.search(jQuery(this).val().toLowerCase(), 'status_flag');
            });

            jQuery('#kt_datatable_search_status').selectpicker();

            datatable.on('datatable-on-check datatable-on-uncheck', function (e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                jQuery('#kt_datatable_selected_records').html(count);
                if (count > 0) {
                    jQuery('#kt_datatable_group_action_form').collapse('show');
                } else {
                    jQuery('#kt_datatable_group_action_form').collapse('hide');
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
                //serverSelectorDemo();
            },
            reload: function () {
                datatable.reload();
            },
        };
    })();

    async function fetchEventInfo() {
        let res = await apiFetch(`${__bakney.env.API.EVENT.LIST}?event_id=${params.id}`);
        row = res.response;
    }

    onMount(() => {
        localStorage.removeItem('kt_datatable-1-meta');
        ktdatable.init();
        fetchEventInfo();

        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
        jQuery('body').popover({selector: '[data-toggle=popover]', trigger: 'hover'});
    });

    onDestroy(() => {
        document.querySelectorAll('.popover').forEach(popover => popover.remove());
    });
</script>

<div
    in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}
    class="d-flex flex-column-fluid font-weight-bold text-dark-50">
    <!--begin::Container-->
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header p-0 border-0">
                <div class="card-toolbar p-0">
                    <BackButton />
                </div>
                <h3 class="card-title font-size-h2">
                    <span class="d-none d-md-inline-block">Informazioni Evento</span>
                </h3>
                <div class="card-toolbar" />
            </div>
            <div class="card-body p-0">
                <div class="mb-2">
                    <div class="row">
                        <div class="col col-12 col-md-3 text-center mb-10">
                            <div style={row?.locandina ? '' : 'background: #eee;height: 250px;border-radius:.35rem;'}>
                                {#if row?.locandina}
                                    <img src={row?.locandina} height="250" alt="locandina evento" />
                                {:else}
                                    <div
                                        style="margin: auto; height: 100%; display: flex; justify-content: center; align-items: center;">
                                        nessuna locandina.
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="col col-12 col-md-9">
                            <h1 style="font-size: 3.7rem;" class="text-dark font-weight-boldest">{row?.title || ''}</h1>
                            <p class="my-6 text-dark-75">
                                <span class="label label-lg font-weight-bold label-light-info label-inline mr-2"
                                    >Aperto {row?.open_to == 1 ? 'a tutti' : 'ai tesserati'}</span>
                                {#if row?.start_date}
                                    <span class="label label-lg font-weight-bold label-light-info label-inline mr-2"
                                        >dal <span class="font-weight-boldest mx-1"
                                            >{moment(new Date(row?.start_date)).format('DD/MM/YYYY')}</span>
                                        al
                                        <span class="font-weight-boldest mx-1"
                                            >{moment(new Date(row?.end_date)).format('DD/MM/YYYY')}</span
                                        ></span>
                                {/if}
                            </p>
                            <p style="font-size: 1.2rem;">
                                {row?.description || 'nessuna descrizione fornita.'}
                            </p>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-12 my-8">
                            <h1 class="text-dark mb-12">Modalità d'iscrizione all'evento</h1>
                            <div class="row">
                                {#if row?.subscription_types}
                                    {#each Array.from(row?.subscription_types) || [] as sub}
                                        <div class="col-12 col-md-2 text-center mx-0 mx-md-4 my-4 my-md-0 p-0">
                                            <div
                                                class="p-4 d-flex align-items-center justify-content-center flex-column"
                                                style="background:#f3f6f9;border-radius: .35rem;outline: .2rem solid #eaf1f7;">
                                                <h2 class="text-primary font-weight-boldest">
                                                    {EURcurrency.format(parseFloat(sub?.amount))}
                                                </h2>
                                                <p class="text-dark-75 text-sm m-0">
                                                    {sub?.medical_certificate_required
                                                        ? 'richiesto certificato medico'
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin: Search Form-->
                <!--begin::Search Form-->
                <div class="mb-2">
                    <h1 class="text-dark mb-8">Lista partecipanti</h1>
                    <div class="row align-items-center">
                        <div class="col-lg-9 col-xl-8">
                            <div class="row align-items-center">
                                <div class="col-md-4 my-2 my-md-0">
                                    <div class="input-icon">
                                        <input
                                            type="text"
                                            class="form-control form-control-solid mb-0"
                                            placeholder="Cerca..."
                                            id="kt_datatable_search_query" />
                                        <span>
                                            <i class="flaticon2-search-1 text-muted" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin: Datatable-->
                <div class="datatable datatable-bordered datatable-head-custom" id="kt_datatable" />
                <!--end: Datatable-->
            </div>
        </div>
        <!--end::Card-->
    </div>
    <!--end::Container-->
</div>
