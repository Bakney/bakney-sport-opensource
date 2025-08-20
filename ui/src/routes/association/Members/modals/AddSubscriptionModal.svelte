<script>
    import {createEventDispatcher, onMount} from 'svelte';
    import BasicModal from 'components/modals/BasicModal.svelte';
    import SubscriptionSelection from './partials/subscription-selection.svelte';
    import CourseSelection from './partials/course-selection.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';

    const dispatch = createEventDispatcher();

    export let id;
    export let show;
    export let target = '#portal-elements-foreground';
    let hideBack = false;
    export let formData = {
        type: 1,
        plan_id: null,
        membership_plan_id: null,
        role: 1,
    };
    let wizard = {
        step: 1,
        steps: [
            {
                id: 1,
                title: 'Seleziona il tipo di iscrizione',
                description: 'Seleziona il tipo di iscrizione',
            },
            {
                id: 2,
                title: 'Seleziona corsi e carnet',
                description: 'Seleziona corsi e carnet',
            },
        ],
    };

    async function add(e) {
        e.preventDefault();
        let bodyRequest = {
            new_user_account: {
                new_member: false,
            },
            sport_association: formData.sport_association,
            plan_id: formData.plan_id != '-' ? formData.plan_id : null,
            membership_plan_id: formData.membership_plan_id != '-' ? formData.membership_plan_id : null,
            associate_data: {...formData.associate, type: formData.type, role: formData.role},
            signature: {
                there_is_signature: false,
                data: '',
            },
            medical_certificate: {
                medical_id: formData.medical,
            },
            custom_data: formData.custom_data || {},
            additional_fields: formData.additional_fields || {},
            tags: formData.tags,
            user: formData.user,
            courses: formData.renewal_info?.courses || [],
            //carnets: formData.renewal_info?.carnets || [],
        };

        // convert born date to dd/mm/yyyy
        bodyRequest.associate_data.born_date = moment(bodyRequest.associate_data.born_date).format('DD/MM/YYYY');

        let res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.RENEW, id), {
            method: 'POST',
            body: JSON.stringify(bodyRequest),
        });

        if (res.status === 200) {
            toast.success('Iscrizione Rinnovata.');
        } else {
            toast.error(res.response?.msg ?? "Errore nel rinnovo dell'iscrizione.");
        }

        dispatch('confirm');
        show = false;
    }
</script>

<div class={hideBack ? 'd-none' : ''}>
    <BasicModal
        id={`renewal-modal-${id}`}
        bind:show
        {target}
        title="Iscrivi"
        showTitle={true}
        modalSize={'md'}
        showFooter={false}
        scrollable={false}
        on:close={() => {
            dispatch('close');
        }}
        dataHeight={300}>
        <form class="w-100" on:submit|preventDefault={add}>
            <div class="d-{wizard.step === 1 ? 'block' : 'none'}">
                <SubscriptionSelection bind:formData />
            </div>
            <div class="d-{wizard.step === 2 ? 'block' : 'none'}">
                <CourseSelection bind:formData getSubscriptionInfo={false} />
            </div>
            <div class="d-flex justify-content-between mb-2">
                {#if wizard.step === 1}
                    <button
                        type="button"
                        class="btn btn-secondary font-weight-bolder"
                        on:click={() => {
                            show = false;
                        }}>Chiudi</button>
                    {#if formData.type === 2 || formData.type === 3}
                        <button type="button" class="btn btn-primary font-weight-bolder" on:click={() => wizard.step++}
                            >Continua</button>
                    {:else}
                        <button type="submit" class="btn btn-primary font-weight-bolder">Iscrivi</button>
                    {/if}
                {:else if wizard.step === 2}
                    <button type="button" class="btn btn-secondary font-weight-bolder" on:click={() => wizard.step--}
                        >Indietro</button>
                    <button type="submit" class="btn btn-primary font-weight-bolder">Iscrivi</button>
                {/if}
            </div>
        </form>
    </BasicModal>
</div>
