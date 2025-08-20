<script>
    import {onMount} from 'svelte';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import Info from './sections/Info.svelte';
    import Usage from './sections/Usage.svelte';
    import {PlusCircle, User, UsersThree} from 'phosphor-svelte';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import AddCarnetModal from './modals/AddCarnetModal.svelte';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params = {};

    let data = {};
    let activeTab = 'info';
    let updateBtn;
    let delta = -1;

    onMount(async () => {
        // fetch data from server
        await fetchData();
        if (params.page) switchTab(params.page);
    });

    async function fetchData(page) {
        const res = await apiFetch(replaceUID(__bakney.env.API.CARNET.INFO, params.carnetId), {
            method: 'GET',
        });

        if (!res.error) {
            data = res.response.data;
        } else {
            toast.error('Qualcosa è andato storto.');
        }

        if (page) {
            switchTab(page);
        }
    }

    async function updateData() {
        KTUtil.btnWait(updateBtn, 'spinner spinner-right spinner-white pr-15', '');

        const res = await apiFetch(replaceUID(__bakney.env.API.CARNET.UPDATE, data.carnet_id), {
            method: 'PATCH',
            body: JSON.stringify({
                title: data.title,
                description: data.description,
                fee: data.fee.replace(',', '.'),
                lessons_number: data.lessons_number,
                public: data.public,
            }),
        });
        setTimeout(() => {
            KTUtil.btnRelease(updateBtn);

            if (!res.error) {
                toast.success('Carnet aggiornato con successo.');
            } else {
                toast.error('Qualcosa è andato storto.');
            }
            fetchData();
        }, 500);
    }

    function switchTab(tab) {
        if (activeTab != tab) delta -= 1;
        switch (tab) {
            case 'info':
                activeTab = 'info';
                break;
            case 'usage':
                activeTab = 'usage';
                break;
            default:
                activeTab = 'info';
        }
    }
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container container-overlay">
        <!--begin::Card-->
        <div class="card card-custom gutter-b">
            <div class="card-header header-mobile-btn-back p-0">
                <div class="card-toolbar d-flex gap-4" style="gap: .5rem;">
                    <BackButton />
                </div>
                <div class="card-toolbar">
                    <h3 class="card-title font-size-h2">{data.title}</h3>
                </div>
                <div class="card-toolbar">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if activeTab === 'info'}
                        <button
                            disabled={activeTab !== 'info' || !canPerformAction('association.carnet.update')}
                            bind:this={updateBtn}
                            type="reset"
                            on:click={updateData}
                            class="btn btn-primary font-weight-bolder">Salva</button>
                    {:else if activeTab === 'usage'}
                        <button
                            disabled={!canPerformAction('association.carnet.update')}
                            on:click={() => {
                                let addCarnetModal = new AddCarnetModal({
                                    target: document.body,
                                    intro: true,
                                    props: {
                                        show: true,
                                        id: data.carnet_id,
                                    },
                                });

                                addCarnetModal.$on('update', () => {
                                    fetchData('usage');
                                });
                            }}
                            class="btn btn-primary font-weight-bolder d-flex align-items-center">
                            <PlusCircle size={16} weight="bold" class="mr-1" />
                            <span class="d-none d-md-inline-block">Assegna carnet</span>
                        </button>
                    {/if}
                </div>

                <div class="card-toolbar m-0 pt-4" style="width: 100%;overflow-x: auto;">
                    <ul
                        class="nav nav-tabs nav-bold nav-tabs-line border-0"
                        style="min-width: 50rem; overflow-x: auto; overflow-y: hidden; border: 0 !important;">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li class="nav-item" on:click={() => switchTab('info')}>
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a
                                class="nav-link"
                                class:active={activeTab === 'info'}
                                href="/#/course/carnet/list/detail/{params.carnetId}/info">
                                <span class="nav-icon mr-1">
                                    <User size="19" color={activeTab == 'info' ? '#351DC2' : '#888'} weight="duotone" />
                                </span>
                                <span class="nav-text">Dettagli</span>
                            </a>
                        </li>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li class="nav-item" on:click={() => switchTab('usage')}>
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a
                                class="nav-link"
                                class:active={activeTab === 'usage'}
                                href="/#/course/carnet/list/detail/{params.carnetId}/usage">
                                <span class="nav-icon mr-1">
                                    <UsersThree
                                        size="19"
                                        color={activeTab == 'usage' ? '#351DC2' : '#888'}
                                        weight="duotone" />
                                </span>
                                <span class="nav-text">Utilizzo</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="card-body p-0">
                {#if activeTab === 'info'}
                    <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                        <Info bind:info={data} />
                    </div>
                {:else if activeTab === 'usage'}
                    <div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
                        <Usage bind:info={data} on:updateCarnet={() => fetchData('usage')} />
                    </div>
                {/if}
            </div>
        </div>
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        .nav-link {
            cursor: pointer;
        }
        .nav-link.active {
            border-bottom: 4px solid #351dc2 !important;
        }
        .nav-link:hover {
            border-bottom: 4px solid #351dc2 !important;
        }
        .card-toolbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</svelte:head>
