<script>
    import {onMount} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {scale} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import {CaretCircleDown, CaretCircleUp, RepeatOnce, Smiley} from 'phosphor-svelte';
    import ContentLoader from 'svelte-content-loader';
    import {toast} from 'svelte-sonner';

    let carnetList = [];

    let statusMap = {
        false: 'in attesa',
        true: 'Pagato',
    };

    let statusColorMap = {
        false: 'light-warning',
        true: 'light-success',
    };

    let statusColorIcons = {
        false: 'warning',
        true: 'success',
    };

    let statusIconMap = {
        false: 'fas fa-clock',
        true: 'fas fa-check-circle',
    };

    let loading = true;

    export let params;

    async function fetchData() {
        loading = true;
        let res = await apiFetch(__bakney.env.API.CARNET.LIST);

        if (!res.error) {
            carnetList = Object.values(res.response.data) || [];
        }
        loading = false;
    }

    onMount(async () => {
        await fetchData();
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container" style="max-width: 70rem !important;">
        {#if !loading}
            <div class="row">
                {#if carnetList?.length == 0}
                    <div class="col-12">
                        <div class="d-flex flex-column justify-content-center align-items-center m-12">
                            <Smiley size={64} color="#000" weight="duotone" />
                            <h4 class="text-dark font-weight-boldest mt-4">Nessun carnet</h4>
                            <p class="text-dark-75 font-weight-bold">Troverai qui i carnet acquistati.</p>
                        </div>
                    </div>
                {/if}

                {#each carnetList as carnet, id}
                    <div
                        in:scale|local={{delay: 20 * id, duration: 50, start: 0.98, easing: easing.cubicInOut}}
                        class="w-100 border rounded-lg mb-12 overflow-hidden mx-4">
                        <div class="card card-custom">
                            <div class="card-body p-6">
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="col-12 p-0 d-flex justify-content-between mb-1 mt-2">
                                            <div class="d-flex justify-content-end text-right align-items-center ml-1">
                                                <h3 class="mb-1 font-weight-boldest">
                                                    {carnet.carnet.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <div class="col-12 p-0 d-flex justify-content-between my-2">
                                            <div
                                                class="d-flex justify-content-end text-right align-items-center ml-1 font-weight-bold">
                                                <span class="text-muted font-weight-bold">Carnet associato a </span>
                                                <span class="text-dark font-weight-bolder ml-2">
                                                    {carnet.subscription.associate.first_name}
                                                    {carnet.subscription.associate.last_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6 d-flex justify-content-end align-items-center">
                                        <span
                                            class="font-size-h6 bg-light border border-light-dark rounded py-1 px-3 mb-0 mr-4 font-weight-bolder">
                                            {carnet.meta.lessons_left} / {carnet.meta.lessons_counter}
                                        </span>
                                        <button
                                            class="btn btn-sm btn-primary mb-0 font-weight-bolder py-2 px-3"
                                            on:click={() => {
                                                swal.fire({
                                                    text: `Vuoi riassegnare un nuovo carnet con le stesse impostazioni a ${carnet.subscription.associate.first_name} ${carnet.subscription.associate.last_name}?`,
                                                    icon: 'question',
                                                    buttonsStyling: true,
                                                    showCancelButton: true,
                                                    cancelButtonText: 'Annulla',
                                                    confirmButtonText: 'Ricarica',
                                                    reverseButtons: true,
                                                    confirmButtonColor: '#d63030',
                                                }).then(async function (result) {
                                                    if (result.isConfirmed) {
                                                        KTApp.blockPage({
                                                            overlayColor: '#000000',
                                                            state: 'primary',
                                                            message: 'Ricarica carnet in corso...',
                                                        });

                                                        const response = await apiFetch(
                                                            replaceUID(
                                                                __bakney.env.API.CARNET_SUBSCRIPTION.TOP_UP,
                                                                carnet.carnet_subscription_id
                                                            ),
                                                            {
                                                                method: 'POST',
                                                            }
                                                        );

                                                        KTApp.unblockPage();

                                                        if (!response.error) {
                                                            fetchData();
                                                            toast.success('Carnet Ricaricato!');
                                                        } else {
                                                            toast.error('Qualcosa è andato storto.');
                                                        }
                                                    }
                                                });
                                            }}>
                                            <RepeatOnce size="18" weight="duotone" class="mr-1" /> Ricarica
                                        </button>
                                    </div>
                                </div>
                                {#if carnet?.course?.length > 0}
                                    <div class="col-12 p-0 mt-4">
                                        {#each Array.from(carnet?.course || []) as course}
                                            <div class="badge border font-weight-bold py-2 px-3 mr-2">
                                                {course.course_title}
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                                <div class="col-12 p-0 mt-4">
                                    <div
                                        on:click={() => (carnet.show_registry = !carnet.show_registry)}
                                        class="p-4 cursor-pointer d-flex justify-content-between align-items-left flex-column border rounded">
                                        {#if !carnet.show_registry}
                                            <div class="font-weight-bold">
                                                <CaretCircleDown size="20" class="mr-1" weight="duotone" /> Mostra le lezioni
                                                associate
                                            </div>
                                        {:else}
                                            <div class="font-weight-bold mb-4">
                                                <CaretCircleUp size="20" class="mr-1" weight="duotone" /> Nascondi le lezioni
                                                associate
                                            </div>
                                        {/if}
                                        {#if carnet?.meta?.lessons_registry?.length > 0 && carnet.show_registry}
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="d-flex align-items-center">
                                                    <span class="text-dark font-size-h5 font-weight-bolder mb-2">
                                                        Lezioni effettuate
                                                    </span>
                                                </div>
                                            </div>
                                            {#each carnet?.meta?.lessons_registry || [] as lesson}
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div class="d-flex align-items-center">
                                                        <span class="text-dark font-weight-bold">
                                                            {moment(lesson?.date).format('DD/MM/YYYY - HH:mm')}
                                                        </span>
                                                        <span class="text-muted font-weight-bold ml-2">
                                                            {lesson?.course?.title}
                                                            {#if lesson?.title}
                                                                <span class="text-muted font-weight-bold ml-2">
                                                                    ({lesson?.title})
                                                                </span>
                                                            {/if}
                                                        </span>
                                                    </div>
                                                </div>
                                            {/each}
                                        {:else if carnet?.meta?.lessons_registry?.length == 0 && carnet.show_registry}
                                            nessuna lezione presente.
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <ContentLoader width="100%" primaryColor="#6b6b6b1f" secondaryColor="#eaf1f7" />
        {/if}
    </div>
</div>
