<script>
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';
    import {push, replace} from 'svelte-spa-router';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';

    export let id = '';
    export let sport_association_id = '';
    export let carnet = '';
    export let callback = () => {
        console.info('reload');
    };
    export let loading = true;
    export let associates = [];

    export let currentStep = 0;
    let canContinue = false;

    $: {
        if (currentStep === 0) {
            canContinue = associates.some(x => x.selected);
        } else if (currentStep === 1) {
            canContinue = associates.some(
                x => x.selected && ((x.courses.length > 0 && x.courses.some(c => c.selected)) || x.courses.length === 0)
            );
        } else {
            canContinue = true;
        }
    }

    onMount(async () => {
        loading = false;
    });

    export function reset() {
        fetchData();
    }

    export async function fetchData() {
        let res = await apiFetch(__bakney.env.API.SUBSCRIPTION.LIST, {method: 'GET'});
        if (!res.error) {
            associates = (Object.values(res.response.data) || [])
                .filter(x => x.sport_association.sport_association_id == sport_association_id)
                .map(x => {
                    return {
                        subscription_id: x.subscription_id,
                        full_name: x.associate.first_name + ' ' + x.associate.last_name,
                        selected: false,
                        courses: [...x.courses],
                    };
                });
        }
    }

    async function assignCarnet() {
        let responses = [];
        let responsesData = [];
        for (const associate of associates) {
            if (!associate.selected) continue;

            let payload = {};
            if (associate.courses.length > 0) {
                payload = {
                    course_subscription_id: associate.courses.find(c => c.selected)?.course_subscription_id,
                };
            }

            let response = await apiFetch(
                replaceUID(replaceUID(__bakney.env.API.CARNET.ASSIGN, id), associate.subscription_id, '<sub_uid>'),
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            if (!response.error) {
                responses.push(true);
                responsesData.push(response);
            } else {
                let modalText =
                    response.status == 403
                        ? 'Operazione non permessa.'
                        : 'Scusa, ho individuato degli errori, riprova.';
                toast.error(modalText);
            }
        }
        if (!responses.every(x => x)) {
            toast.error('Si sono verificati degli errori.');
        } else {
            toast.success('Carnet aggiunti!');
            await callback();
            if (responses.length > 1) push('/payment/list');
            else push('/payment/list/' + (responsesData[0].response?.course_subscription_id || ''));
        }
    }
</script>

<div
    class="modal fade"
    id="subscription-carnet-{id}"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                    Acquisto carnet (<span class="font-weight-boldest">{carnet}</span>)
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close" />
                </button>
            </div>
            <div class="modal-body">
                <div class="scroll scroll-pull" data-scroll="true" data-height="400">
                    {#if currentStep == 0}
                        <p>
                            Seleziona gli atleti per cui vuoi acquistare il carnet <span
                                class="font-weight-boldest text-dark-75">{carnet}</span
                            >.
                            <br />
                            Potrai pagare i carnet acquistati in un secondo momento, nella sezione
                            <span class="font-weight-boldest text-dark-75">Pagamenti</span>.
                        </p>
                        <div class="form-group row mb-0">
                            <div class="col-12 col-form-label">
                                <div class="checkbox-list">
                                    {#each associates || [] as associate}
                                        <label
                                            class="checkbox checkbox-darker"
                                            class:selected-checkbox-container={associate.selected}>
                                            <input
                                                type="checkbox"
                                                name={associate.id}
                                                bind:checked={associate.selected} />
                                            <span />
                                            {associate.full_name}
                                        </label>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {:else if currentStep == 1}
                        <p>Seleziona i corsi a cui gli atleti parteciperanno col carnet.</p>
                        <div class="form-group row mb-0">
                            <div class="col-12 col-form-label">
                                {#each Array.from(associates || [])?.filter(a => a.selected) as associate}
                                    <div class="mb-4 d-flex flex-column">
                                        <h5>{associate.full_name}</h5>
                                        <div class="mb-4">
                                            {#if associate?.courses?.length > 0}
                                                {#each associate?.courses || [] as course}
                                                    <label
                                                        class="checkbox checkbox-darker mb-3"
                                                        class:selected-checkbox-container={course.selected}>
                                                        <input
                                                            on:click={() => {
                                                                if (course.selected) {
                                                                    course.selected = false;
                                                                } else {
                                                                    associate.courses.forEach(
                                                                        c => (c.selected = false)
                                                                    );
                                                                    course.selected = true;
                                                                }
                                                            }}
                                                            type="checkbox"
                                                            name="course-{associate.full_name}"
                                                            bind:checked={course.selected} />
                                                        <span class="mr-2" />
                                                        {course.course__title}
                                                    </label>
                                                {/each}
                                            {:else}
                                                l'atleta non è iscritto a nessun corso.
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {:else if currentStep == 2}
                        <p>Procedi al pagamento ora o in un secondo momento.</p>
                    {/if}
                </div>
            </div>
            <div class="modal-footer">
                <button
                    on:click={() => {
                        setTimeout(() => {
                            currentStep = 0;
                        }, 300);
                    }}
                    type="button"
                    class="btn btn-light-primary font-weight-bolder"
                    data-dismiss="modal">Chiudi</button>
                <button
                    type="button"
                    disabled={!canContinue}
                    class="btn btn-primary font-weight-bold"
                    on:click={async () => {
                        jQuery(`#subscription-carnet-${id}`).modal('hide');
                        setTimeout(() => {
                            assignCarnet();
                        }, 300);
                    }}>{currentStep < 2 ? 'Continua acquisto' : 'Paga in seguito'}</button>
            </div>
        </div>
    </div>
</div>

<style>
    .checkbox-darker {
        font-size: 1rem;
        padding: 1rem;
        background: #f7f7f7;
        border-radius: 0.5rem;
        word-break: break-word;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 1px solid #351dc205;
    }
    .checkbox-darker > span {
        background-color: #d5d5d7;
    }
    .checkbox-darker > input:checked ~ span {
        background-color: #351dc2;
    }

    .selected-checkbox-container {
        background-color: #e7e6e6 !important;
        font-weight: 600;
    }
</style>
