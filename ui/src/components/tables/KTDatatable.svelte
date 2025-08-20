<script>
    import {XCircle} from 'phosphor-svelte';
    import {onMount} from 'svelte';

    export let id = 'kt_datatable';
    export let searchId = 'kt_datatable_search_query';
    export let selectedCounter = 0;
    export let visibleMultiaction = false;
    export let datatable;
    export let sessionToken = localStorage.getItem('sessionToken')?.replaceAll('"', '');
    export let url;
    export let params = {};
    export let columns = [];
    export let serverPaging = true;
    export let serverFiltering = true;
    export let serverSorting = true;
    export let showDividerFilter = true;
    export let showSearch = true;
    export let mapFunction = function (raw) {
        // sample data mapping
        var dataSet = raw;
        if (typeof raw.data !== 'undefined') {
            dataSet = raw.data;
        }
        return dataSet;
    };
    export let clicked = () => {};

    export let loadFilters = function () {};

    export let KTDatatable = (function () {
        // Private functions

        var options = {
            // datasource definition
            data: {
                responsive: true,
                type: 'remote',
                source: {
                    read: {
                        url: url,
                        method: 'GET',
                        params: params,
                        headers: {
                            Authorization: 'Bearer ' + sessionToken,
                        },
                        map: mapFunction,
                    },
                },
                pageSize: 10,
                serverPaging: serverPaging,
                serverFiltering: serverFiltering,
                serverSorting: serverSorting,
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
                input: jQuery(`#${searchId}`),
                //onEnter: true,
                key: 'generalSearch',
            },

            // columns definition

            columns: [...columns],

            rows: {
                clicked: clicked,
            },
        };

        // basic demo
        var loadDatatable = function () {
            // enable extension
            options.extensions = {
                // boolean or object (extension options)
                checkbox: true,
            };

            options.search = {
                input: jQuery(`#${searchId}`),
                //onEnter: true,
                key: 'generalSearch',
            };

            datatable = jQuery(`#${id}`).KTDatatable(options);

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

            // handle init filters
            loadFilters();
        };

        return {
            // public functions
            init: function () {
                loadDatatable();
            },
            reload: function () {
                datatable.reload();
            },
        };
    })();

    export function isMobile() {
        return KTUtil.isMobileDevice();
    }

    onMount(() => {
        KTDatatable.init();
    });
</script>

<div class="mb-2">
    <div class="row align-items-center mx-0">
        <div class="col-12 pb-2">
            <div class="row align-items-center justify-content-left">
                {#if showSearch}
                    <div class="my-1 my-md-0 mr-2 d-flex">
                        <div class="input-icon d-flex">
                            <input
                                type="text"
                                class="form-control form-control-solid mb-0"
                                style="max-width: 28rem;width: 28rem"
                                placeholder="Cerca..."
                                id={searchId} />
                            <span>
                                <i class="flaticon2-search-1 text-muted" />
                            </span>
                            <button
                                style="position: absolute;right:0;"
                                class="btn btn-icon btn-ghost mb-0"
                                on:click={() => {
                                    // clear search input
                                    document.getElementById(searchId).value = '';
                                    setTimeout(() => {
                                        document.getElementById(searchId).dispatchEvent(new Event('keyup'));
                                    }, 200);
                                }}>
                                <XCircle size={19} weight="duotone" />
                            </button>
                        </div>
                    </div>
                {/if}

                <slot name="search-header" />
            </div>
        </div>
        {#if showDividerFilter}
            <hr class="w-100 mb-2" style="opacity:0.3;" />
        {/if}
    </div>
</div>
<slot name="multiactions" />
<div class="datatable datatable-bordered datatable-head-custom" {id} />
