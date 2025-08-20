<script>
    import * as easing from 'svelte/easing';
    import {scale} from 'svelte/transition';
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {PencilSimple, PlusCircle} from 'phosphor-svelte';
    import SimpleCarousel from 'components/lists/SimpleCarousel.svelte';
    import SimpleCard from 'components/cards/simple-card.svelte';
    import AddServiceModal from './modals/AddServiceModal.svelte';
    import EditServiceModal from './modals/EditServiceModal.svelte';
    import {EURcurrency} from 'utils/Functions.js';
    import LongTextPopover from 'components/popovers/LongTextPopover.svelte';
    import CampsAndRetreatsPeriodsForm from './modals/camps-and-retreats-periods-form.svelte';
    import {toast} from 'svelte-sonner';
    import {canPerformAction} from 'utils/Permissions';
    import BackButton from 'components/buttons/BackButton.svelte';

    export let params;

    let data;
    let datatable;

    async function fetchData() {
        let res = await apiFetch(replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.PERIODS.INFO, params.periodId), {
            method: 'GET',
        });

        if (res.status === 200) {
            data = res.response.data;
        } else {
            toast.error('Errore nel recupero dei dati.');
        }
    }

    async function update(formData) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Salvataggio...',
        });

        // convert fee to float
        formData.fee = parseFloat(String(formData.fee).replace(',', '.'));
        // format from_date and to_date to YYYY-MM-DDThh:mm:ss[.SSS][+HH:mm|-HH:mm|Z]
        formData.start_date = moment(formData.start_date, 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss');
        formData.end_date = moment(formData.end_date, 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss');

        const url = replaceUID(__bakney.env.API.CAMPS_AND_RETREATS.PERIODS.UPDATE, params.periodId);

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200 || res.status == 201) {
            toast.success('Salvato con successo.');
            fetchData();
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            });
        }
    }

    onMount(async () => {
        await fetchData();
    });
</script>

<div class="card mx-2 mx-md-4" in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}}>
    <div class="mx-0 mx-md-3 mt-4 mt-md-0 d-flex justify-content-between align-items-center mb-4">
        <div>
            <BackButton />
        </div>
        <div>
            <h3 class="font-size-h4 font-size-h2-md font-weight-bold text-dark">{data?.title}</h3>
        </div>
        <div>
            {#if canPerformAction('association.campsandretreats.update')}
                <button
                    class="btn btn-primary font-weight-bolder"
                    on:click={() => {
                        document.getElementById('submit-update-form').click();
                    }}>
                    Salva
                </button>
            {/if}
        </div>
    </div>

    <div>
        <CampsAndRetreatsPeriodsForm
            {data}
            id={params.id}
            isInModal={false}
            on:sumbit={e => {
                if (e.detail.valid) {
                    update(e.detail.data);
                }
            }}>
            <button slot="footer" id="submit-update-form" class="d-none" type="submit">Submit</button>
        </CampsAndRetreatsPeriodsForm>
    </div>

    <h2 class="mx-0 mx-md-3 mt-8 font-weight-bolder text-center mb-18">Servizi della settimana</h2>

    <div class="mx-0 mx-md-3 mb-24">
        <SimpleCarousel props={{class: 'h-140px'}}>
            {#each Array.from(data?.services || []) as service}
                <SimpleCard>
                    <div slot="header">
                        {service?.title}
                        <div class="font-size-sm font-weight-bold">
                            {service?.payment_category_info.name || 'Nessuna causale'}
                        </div>
                    </div>
                    <div slot="content">
                        <span class="text-primary border rounded-lg py-1 px-2 bg-light font-weight-boldest">
                            {EURcurrency.format(parseFloat(String(service?.fee).replace(',', '.') || 0))}
                        </span>
                        <div class="mt-4 h-30px">
                            <LongTextPopover text={service?.description || 'Nessuna descrizione'} title="Descrizione" />
                        </div>
                    </div>
                    <div slot="footer">
                        <button
                            on:click={() => {
                                let modal = new EditServiceModal({
                                    target: document.body,
                                    props: {
                                        show: true,
                                        data: service,
                                        id: data?.camps_and_retreats_period_id,
                                        ktdatable: datatable,
                                    },
                                });

                                modal.$on('close', () => {
                                    modal.$destroy();
                                });

                                modal.$on('update', e => {
                                    fetchData();
                                });
                            }}
                            class="btn btn-primary btn-sm flex align-items-center mb-2 font-weight-bolder">
                            <PencilSimple weight="duotone" class="mr-1" />
                            Modifica
                        </button>
                    </div>
                </SimpleCard>
            {/each}
            {#if canPerformAction('association.campsandretreats.create')}
                <div class="d-flex align-items-center justify-content-center border rounded-lg py-24 px-12">
                    <button
                        on:click={() => {
                            let modal = new AddServiceModal({
                                target: document.body,
                                props: {
                                    show: true,
                                    id: data?.camps_and_retreats_period_id,
                                    ktdatable: datatable,
                                },
                            });

                            modal.$on('close', () => {
                                modal.$destroy();
                            });

                            modal.$on('update', e => {
                                fetchData();
                            });
                        }}
                        class="btn btn-primary btn-sm mb-0 mx-8 w-auto d-flex align-items-center font-weight-bolder">
                        <PlusCircle size={18} weight="duotone" class="mr-1" />
                        Servizio
                    </button>
                </div>
            {/if}
        </SimpleCarousel>
    </div>
</div>
