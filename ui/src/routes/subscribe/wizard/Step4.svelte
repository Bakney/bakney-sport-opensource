<script>
    import {onMount} from 'svelte';
    import {ArrowLeft, ArrowRight, Warning} from 'phosphor-svelte';

    export let wizardData;
    export let creatingSubscription = false;
    let userData = null;

    onMount(() => {
        userData = JSON.parse(localStorage.getItem('userData') || null);
    });
</script>

<div>
    <h2 class="mb-8 font-weight-boldest text-dark">Riepilogo Iscrizione</h2>

    {#if wizardData?.sportAssociationData?.user?.sport_association?.enable_quotes_management}
        <div class="mb-6 d-flex flex-column align-items-start w-100">
            <span class="font-weight-bold mb-4">L'iscrizione prevede il pagamento delle seguenti quote:</span>

            {#if wizardData.formData.associate_data.type == 1 || wizardData.formData.associate_data.type == 2}
                {#if wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee}
                    <h3 class="font-weight-boldest">Quota associativa</h3>
                    <h4 class="text-info font-weight-boldest py-3 px-6 rounded text-center mb-4 bg-light-info w-50">
                        {#if wizardData.formData.plan_id}
                            {wizardData.formData.plan_label}
                        {:else if wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee}
                            Nessuna quota associativa selezionata
                        {:else if !wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee && parseFloat(wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee) > 0}
                            <span class="font-weight-bold">Associativa </span>(
                            {parseFloat(
                                wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee
                            ).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            })})
                        {:else if !wizardData?.sportAssociationData?.user?.sport_association?.multiple_subscription_fee && parseFloat(wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee) === 0}
                            Gratuito
                        {:else}
                            {wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee_plans[0]?.name}
                            (€
                            {parseFloat(
                                wizardData?.sportAssociationData?.user?.sport_association?.subscription_fee_plans[0]
                                    ?.subscription_fee
                            ).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })}
                            )
                        {/if}
                    </h4>
                {/if}
            {/if}

            {#if wizardData.formData.associate_data.type == 2 || wizardData.formData.associate_data.type == 3}
                {#if wizardData?.sportAssociationData?.user?.sport_association?.membership_fee}
                    <h3 class="font-weight-boldest">Quota tesseramento</h3>
                    <h4 class="text-info font-weight-boldest py-3 px-6 rounded text-center mb-4 bg-light-info w-50">
                        {#if wizardData.formData.membership_plan_id}
                            {wizardData.formData.membership_plan_label}
                        {:else if wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee}
                            Nessuna quota associativa selezionata
                        {:else if !wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee && parseFloat(wizardData?.sportAssociationData?.user?.sport_association?.membership_fee) > 0}
                            <span class="font-weight-bold">Tesseramento </span>(
                            {parseFloat(
                                wizardData?.sportAssociationData?.user?.sport_association?.membership_fee
                            ).toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2,
                            })})
                        {:else if !wizardData?.sportAssociationData?.user?.sport_association?.multiple_membership_fee && parseFloat(wizardData?.sportAssociationData?.user?.sport_association?.membership_fee) === 0}
                            Gratuito
                        {:else}
                            {wizardData?.sportAssociationData?.user?.sport_association?.membership_fee_plans[0]?.name}
                            (€
                            {parseFloat(
                                wizardData?.sportAssociationData?.user?.sport_association?.membership_fee_plans[0]
                                    ?.membership_fee
                            ).toLocaleString('it-IT', {
                                minimumFractionDigits: 2,
                            })}
                            )
                        {/if}
                    </h4>
                {/if}
            {/if}
        </div>
    {/if}

    <div class="mb-6">
        <h6 class="font-weight-boldest text-primary">Account</h6>
        {#if userData && userData.username && userData.email}
            Stai per mandare un iscrizione collegata al tuo account <span class="text-primary font-weight-boldest"
                >{userData.username ? `@${userData.username}` : ' non specificato '}</span>
            con email
            <b>{userData.email || ' non specificata '}</b>.
            <br />
            {#if userData.avatar_image}
                <img src={userData.avatar_image} alt="avatar" class="img-fluid rounded-circle mt-4" />
            {/if}
        {:else}
            Stai per mandare un'iscrizione che sarà gestita dall'associazione sportiva.
        {/if}
    </div>
    <div class="mb-6">
        <h6 class="font-weight-boldest text-primary">Informazioni Atleta</h6>
        <div class="font-weight-bold">
            L'atleta <b
                >{wizardData.formData.associate_data.first_name}
                {wizardData.formData.associate_data.last_name}</b>

            {#if wizardData.formData.associate_data.is_minor}
                è minorenne.
            {:else}
                è maggiorenne.
            {/if}
        </div>
    </div>

    <!-- Firma -->
    <div class="mb-6">
        <h6 class="font-weight-boldest text-primary">Firma</h6>
        {#if wizardData.formData.signature?.there_is_signature}
            Il modulo di iscrizione è stato firmato.
            <br />
            {#if wizardData.formData.signature?.data}
                <img height="60" src={wizardData.formData.signature.data} alt="signature" />
            {/if}
        {:else}
            Il modulo di iscrizione non è stato firmato.
        {/if}
    </div>

    <!-- Certificato Medico -->
    <div class="mb-6">
        <h6 class="font-weight-boldest text-primary">Certificato Medico</h6>
        {#if wizardData.formData.medical_certificate?.medical_id}
            Il certificato medico è stato caricato.
            <br />
        {:else}
            Il certificato medico non è stato caricato.
        {/if}
    </div>

    <hr class="mt-10" />
    <div class="d-flex justify-content-between align-items-center">
        <button
            type="button"
            class="btn btn-sm btn-ghost font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
            on:click={wizardData.prevStep}>
            <ArrowLeft size={24} /> Indietro
        </button>
        {#if !creatingSubscription}
            <button
                type="button"
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
