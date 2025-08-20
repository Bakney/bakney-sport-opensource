<script>
    import {Plus, PencilSimple, Trash, CheckCircle, XCircle, ArrowLeft, ArrowRight, UserList} from 'phosphor-svelte';
    import MemberDrawer from '../MemberDrawer.svelte';
    export let wizardData;

    export let creatingSubscription = false;

    function openDrawer(index) {
        let athlete = wizardData.multipleEntryFormData[index];
        let drawer = new MemberDrawer({
            target: document.getElementById('portal-elements'),
            props: {
                athlete: athlete,
                title: 'Anagrafica',
                wizardData: {...wizardData},
            },
        });

        drawer.$on('close', e => {
            e.detail.valid = checkValidity(e.detail);
            wizardData.multipleEntryFormData[index] = e.detail;
            wizardData.multipleEntryFormData = [...wizardData.multipleEntryFormData];
        });
    }

    function deleteEntry(index) {
        wizardData.multipleEntryFormData.splice(index, 1);
        wizardData.multipleEntryFormData = [...wizardData.multipleEntryFormData];
    }

    function checkValidity(athlete) {
        let valid = true;
        // check if all required fields are filled
        if (
            !athlete.associate_data.first_name ||
            !athlete.associate_data.last_name ||
            !athlete.associate_data.tax_code ||
            !athlete.associate_data.born_date ||
            !athlete.associate_data.born_city ||
            !athlete.associate_data.address ||
            !athlete.associate_data.address_city ||
            !athlete.associate_data.address_cap
        ) {
            valid = false;
        }

        // check if the tax code is valid
        if (!athlete.associate_data.tax_code.match(/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/)) {
            valid = false;
        }

        // check if the email is valid if it is present
        if (athlete.associate_data.email && !athlete.associate_data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            valid = false;
        }

        // check if the phone is valid if it is present
        if (athlete.associate_data.phone && !athlete.associate_data.phone.match(/^[0-9]{10}$/)) {
            valid = false;
        }

        // check if the born date is valid
        if (
            athlete.associate_data.born_date &&
            !athlete.associate_data.born_date.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)
        ) {
            valid = false;
        }

        // check the type is correct (1 or 2 or 3)
        if (athlete.associate_data.type && ![1, 2, 3].includes(athlete.associate_data.type)) {
            valid = false;
        }

        // check family role is correct (not empty)
        if (athlete.associate_data.family_role && athlete.associate_data.family_role === '') {
            valid = false;
        }

        // check if additional fields are valid if they are required
        wizardData.formData.additional_fields.forEach(field => {
            if (field?.props?.required && (!field?.props?.value || field?.props?.value === '')) {
                valid = false;
            }
        });

        return valid;
    }

    function addMember() {
        let athlete = {
            subscription_id: null,
            preregistration: false,
            membership_plan_id: null,
            membership_plan_label: null,
            plan_id: null,
            plan_label: null,
            additional_fields: [...wizardData.formData.additional_fields],
            custom_data: {
                type: 2,
                type_of_associate: null,
                type_of_request: 'affiliazione',
                membership_number: null,
                type_of_qualifications: null,
                is_multiple: true, // this is a multiple subscription
            },
            associate_data: {
                type: null,
                is_minor: false,
                first_name: '',
                last_name: '',
                sex: 'F',
                tax_code: '',
                born_date: '01/01/2000',
                born_city: '',
                address: '',
                address_city: '',
                address_cap: '',
                phone: '',
                email: '',
                family_role: null,
            },
            associate_tutor_data: {
                first_name: '',
                last_name: '',
                sex: 'F',
                tax_code: '',
                born_date: '01/01/1990',
                born_city: '',
                address: '',
                address_city: '',
                address_cap: '',
                phone: '',
                email: '',
                family_role: null,
            },
            signature: {
                there_is_signature: false,
                data: '',
            },
            new_user_account: {
                new_member: false,
                new_member_info: {
                    first_name: null,
                    last_name: null,
                    phone: null,
                    email: null,
                },
            },
            medical_certificate: {
                certificate_expring_date: null,
                medical_id: null,
                filename: null,
                certificate_expring_date: null,
            },
        };

        let drawer = new MemberDrawer({
            target: document.getElementById('portal-elements'),
            props: {
                athlete: athlete,
                title: 'Anagrafica',
                wizardData: {...wizardData},
            },
        });

        drawer.$on('close', e => {
            let valid = checkValidity(e.detail);
            e.detail.valid = valid;
            // push the new athlete to the array
            wizardData.multipleEntryFormData = [...wizardData.multipleEntryFormData, {...e.detail}];
        });
    }
</script>

<div class="mb-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center">
        <h2 class="h4 font-weight-bolder mb-0">Iscritti</h2>
        <button
            class="btn btn-primary d-flex align-items-center d-flex justify-content-center font-weight-bolder"
            on:click={() => addMember()}>
            <Plus size={16} class="mr-2" weight="bold" />
            <span>Aggiungi iscritto</span>
        </button>
    </div>

    <!-- List of family members -->
    {#if wizardData.multipleEntryFormData.length === 0}
        <div
            class="d-flex flex-column justify-content-center align-items-center text-dark-50 my-auto font-weight-bolder"
            style="height: 200px;">
            <UserList size={64} weight="duotone" class="mb-2" />
            Non ci sono iscritti aggiunti. Clicca il pulsante sopra per aggiungere uno.
        </div>
    {:else}
        <div class="mt-3" style="min-height: 200px;">
            {#each wizardData.multipleEntryFormData as entry, index}
                <div
                    class="mb-3 py-2 px-4 d-flex border-secondary rounded-xl border justify-content-between align-items-center">
                    <div class="d-flex align-items-center font-weight-bolder" style="gap: .5rem;">
                        {#if entry.valid}
                            <CheckCircle size={18} weight="duotone" class="text-success" />
                            <span class="text-success">Dati validi</span>
                        {:else}
                            <XCircle size={18} weight="duotone" class="text-warning" />
                            <span class="text-warning">Dati incompleti</span>
                        {/if}
                        <div class="font-weight-boldest">
                            {entry.associate_data?.first_name || '-'}
                            {entry.associate_data?.last_name || '-'}
                        </div>
                    </div>
                    <div class="d-flex">
                        <button
                            class="btn btn-sm btn-clean mb-0 btn-icon text-secondary"
                            on:click={() => openDrawer(index)}>
                            <PencilSimple size={20} weight="bold" />
                        </button>
                        <button
                            class="btn btn-sm btn-clean mb-0 btn-icon text-danger"
                            on:click={() => deleteEntry(index)}>
                            <Trash size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="d-flex justify-content-between align-items-center mt-12">
        <button
            type="button"
            class="btn btn-sm btn-ghost font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
            on:click={wizardData.prevStep}>
            <ArrowLeft size={24} /> Indietro
        </button>
        {#if !creatingSubscription}
            <button
                type="button"
                disabled={!wizardData.multipleEntryFormData?.some(entry => entry.valid)}
                class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4"
                on:click={wizardData.createSubscription}>
                Completa iscrizione <ArrowRight size={24} />
            </button>
        {:else}
            <button
                type="button"
                disabled={creatingSubscription}
                class="btn btn-sm btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4 d-flex align-items-center">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span class="ml-2">Sto completando l'iscrizione...</span>
            </button>
        {/if}
    </div>
</div>
