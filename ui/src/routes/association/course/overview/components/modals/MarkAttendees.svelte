<script>
    import {onMount, createEventDispatcher, onDestroy, afterUpdate, tick} from 'svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {slide, fade} from 'svelte/transition';
    import {Circle} from 'svelte-loading-spinners';
    import Portal from 'svelte-portal';
    import {canPerformAction} from 'utils/Permissions';
    import {toast} from 'svelte-sonner';
    import {CheckCircle, FirstAidKit} from 'phosphor-svelte';

    const dispatch = createEventDispatcher();

    export let id = '';
    export let courseId = '';
    export let event = '';
    export let events;
    export let full = false;
    export let callback = () => {
        console.info('reload');
    };
    export let courseSubscriptions = [];
    export let dispatchRefreshOnClose = true;

    let availableSubscriptions = [];
    let updating = false;
    let searchKey = '';

    onMount(async () => {
        jQuery(`#attendance-day-${id}`).on('shown.bs.modal', async () => {
            await fetchData();
        });
        jQuery(`#attendance-day-${id}`).on('hidden.bs.modal', () => {
            if (dispatchRefreshOnClose) {
                dispatch('refresh');
            }
            dispatch('close');
        });

        // add esc key listener
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (dispatchRefreshOnClose) {
                    dispatch('refresh');
                }
                dispatch('close');
            }
        });
    });

    async function fetchData() {
        availableSubscriptions = [];
        let availableSubscriptionsTmp = JSON.parse(JSON.stringify(Object.values(courseSubscriptions) || []));

        availableSubscriptionsTmp.forEach(sub => {
            if (!(event.attendees.map(a => a.course_subscription_id).indexOf(sub.course_subscription_id) === -1)) {
                sub.disabled = true;
                sub.selected = true;
            }
        });
        availableSubscriptions = JSON.parse(JSON.stringify(availableSubscriptionsTmp));
        // sort by last name and first name
        availableSubscriptions.sort((a, b) => {
            const lastNameCompare = a.subscription.associate.last_name.localeCompare(
                b.subscription.associate.last_name
            );
            if (lastNameCompare !== 0) return lastNameCompare;
            return a.subscription.associate.first_name.localeCompare(b.subscription.associate.first_name);
        });
    }

    async function updateData(idx, checked) {
        availableSubscriptions[idx].selected = checked;
        updating = true;
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Salvataggio in corso...',
        });

        const response = await apiFetch(
            replaceUID(replaceUID(__bakney.env.API.COURSE.ATTENDEES_UPDATE, courseId), id, '<att_uid>'),
            {
                method: 'POST',
                body: JSON.stringify({
                    attendees: availableSubscriptions
                        .filter(sub => sub.selected)
                        .map(sub => {
                            return {
                                course_subscription_id: sub.course_subscription_id,
                            };
                        }),
                }),
            }
        );

        KTApp.unblockPage();
        // dispatch('refresh');

        if (!response.error) {
            toast.success('Registro presenze aggiornato con successo!');
        } else {
            if (response.status === 412) {
                toast.error(`${response.response.msg || 'Carnet finito.'}`);
            } else {
                toast.error('Qualcosa è andato storto.');
            }
            availableSubscriptions[idx].selected = !checked;
        }
        updating = false;
    }

    const resetSearch = () => {
        searchKey = '';
    };

    onDestroy(() => {
        jQuery(`#attendance-day-${id}`).modal('hide');
    });
</script>

<Portal target="#portal-elements">
    <div
        class="modal fade"
        id="attendance-day-{id}"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modifica Presenze</h5>
                    <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        aria-label="Close"
                        on:click={() => {
                            if (dispatchRefreshOnClose) {
                                dispatch('refresh');
                            }
                            dispatch('close');
                        }}>
                        <i aria-hidden="true" class="ki ki-close" />
                    </button>
                </div>
                <div class="modal-body">
                    <div>
                        <p>
                            Seleziona gli atleti presenti all'evento "<span class="font-weight-boldest"
                                >{event.title}</span
                            >".
                        </p>
                        <div class="form-group mb-4">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="font-weight-bold">Ricerca atleta</label>
                            <div class="input-icon">
                                <input
                                    bind:value={searchKey}
                                    type="text"
                                    class="form-control"
                                    placeholder="Filtra atleta..." />
                                <span><i class="flaticon2-search-1 icon-md" /></span>
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <span
                                    style="position: absolute; right: 0;left:auto;cursor:pointer;"
                                    on:click={resetSearch}><i class="flaticon2-cross icon-sm" /></span>
                                <!-- <span><MagnifyingGlass size="18" weight="regular" /></span> -->
                            </div>
                        </div>
                        {#if Array.from(availableSubscriptions?.filter(sub => !sub.selected) || [])?.length > 0}
                            <div class="form-group row mb-0">
                                <div class="col-12 mb-0 d-flex justify-content-end">
                                    <button
                                        type="button"
                                        class="btn btn-dark btn-sm font-weight-boldest d-flex align-items-center"
                                        on:click={() => {
                                            availableSubscriptions.forEach((sub, idx) => {
                                                if (!sub.disabled) {
                                                    updateData(idx, true);
                                                }
                                            });
                                        }}>
                                        <CheckCircle size="16" weight="bold" class="mr-1" />
                                        Segna tutti presenti
                                    </button>
                                </div>
                            </div>
                        {/if}
                        <div class="form-group row mb-0">
                            <div class="col-12 col-form-label">
                                <div
                                    class="checkbox-list scroll scroll-pull"
                                    style="max-height: 30rem; overflow-y: scroll;"
                                    data-scroll="true"
                                    max-data-height="400px"
                                    in:slide>
                                    <!-- {JSON.stringify(availableSubscriptions)} -->
                                    {#if availableSubscriptions.length == 0 && courseSubscriptions.length > 0}
                                        <div class="d-flex justify-content-center align-items-center">
                                            <Circle size="40" color="#351DC2" unit="px" duration="1s" />
                                        </div>
                                    {/if}
                                    <!-- {#if !updating} -->
                                    {#each availableSubscriptions || [] as sub, idx}
                                        <!-- svelte-ignore a11y-label-has-associated-control -->
                                        <!-- <label class="checkbox checkbox-darker"> -->
                                        <!-- class:selected-checkbox-container={sub.subscription.associate.selected} -->
                                        <!-- <input type="checkbox" name="{sub.subscription.associate.id}" bind:checked={sub.subscription.associate.selected} /> -->
                                        <div
                                            in:slide={{duration: 100, delay: (1 + idx) * 5}}
                                            style="min-height: 3rem;{searchKey && searchKey !== ''
                                                ? !sub.subscription.associate.first_name
                                                      .toLowerCase()
                                                      .includes(searchKey.toLowerCase()) &&
                                                  !sub.subscription.associate.last_name
                                                      .toLowerCase()
                                                      .includes(searchKey.toLowerCase())
                                                    ? 'display:none!important;'
                                                    : ''
                                                : ''}"
                                            class="d-flex align-items-center justify-content-between mb-3 pl-4 list-item-attendees {sub.disabled
                                                ? ''
                                                : ''}">
                                            <div>
                                                <span />
                                                <strong
                                                    >{sub.subscription.associate.last_name}
                                                    {sub.subscription.associate.first_name}
                                                </strong>
                                                <br />
                                                <div
                                                    class="d-flex align-items-center font-weight-bold font-size-sm text-dark-50">
                                                    <FirstAidKit size="12" weight="bold" class="mr-2 text-dark" />
                                                    {@html sub.subscription.associate.medical_label}
                                                </div>
                                            </div>
                                            <span class="switch switch-sm switch-icon">
                                                <label>
                                                    <input
                                                        id={idx}
                                                        on:change={async e => {
                                                            await tick();
                                                            updateData(idx, e.target.checked);
                                                        }}
                                                        disabled={!canPerformAction(
                                                            'association.courses.attendance.update'
                                                        )}
                                                        type="checkbox"
                                                        bind:checked={availableSubscriptions[idx].selected} />
                                                    <span />
                                                </label>
                                            </span>
                                        </div>
                                        <!-- </label> -->
                                    {/each}
                                    <!-- {/if} -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="d-flex align-items-center mr-2 flex-column border rounded-lg p-1">
                        <span class="font-size-xs px-2 text-info font-weight-boldest">
                            {availableSubscriptions.filter(sub => sub.selected).length} / {availableSubscriptions.length}
                            presenti
                        </span>
                        <span class="font-size-xs px-2"
                            ><span class="text-warning font-weight-boldest"
                                >{event?.total_expected_absences || 0} non ci sarò</span
                            ></span>
                    </div>
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="btn btn-light-primary font-weight-bolder"
                        data-dismiss="modal"
                        on:click={() => {
                            if (dispatchRefreshOnClose) {
                                dispatch('refresh');
                            }
                            dispatch('close');
                        }}>Chiudi</a>
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- <button
                        disabled={updating || !canPerformAction('association.courses.attendance.update')}
                        class="btn btn-primary font-weight-bold"
                        on:click={updateData}>
                        {#if updating}
                            <Circle size="18" color="#ffffff" unit="px" duration="1s" />
                        {:else}
                            Salva modifiche
                        {/if}
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</Portal>

<svelte:head>
    <style>
        .disabled-item {
            opacity: 0.6;
            pointer-events: none;
        }
        .list-item-attendees {
            border-left: 0.5rem solid #351dc2;
            padding: 0.5rem;
            border-radius: 0.3rem;
        }
        /* width */
        .checkbox-list::-webkit-scrollbar {
            width: 8px;
            border-radius: 0.55rem;
        }

        /* Track */
        .checkbox-list::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        /* Handle */
        .checkbox-list::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 0.55rem;
        }

        /* Handle on hover */
        .checkbox-list::-webkit-scrollbar-thumb:hover {
            background: #ccc;
        }
    </style>
</svelte:head>

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
