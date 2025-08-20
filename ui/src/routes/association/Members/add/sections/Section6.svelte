<script>
    import {newUserAccount, newAssociate, signature, paymentMethod, medicalCertificate} from 'store/stores.js';
    newUserAccount.useLocalStorage();
    newAssociate.useLocalStorage();
    signature.useLocalStorage();
    paymentMethod.useLocalStorage();
    medicalCertificate.useLocalStorage();

    export let inModal = false;
</script>

<div class="pb-5" data-wizard-type="step-content">
    <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Controlla le Informazioni</h4>

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="subtitle-label">Ancora un ultimo passo...</label>
    <div style="padding-top: 2rem">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="subtitle-label">Informazioni del modulo d'iscrizione</label>
        <span class="form-text text-muted" style="display: block;">
            <b>Premi</b> su una <b>voce</b> per espanderla e controllare le informazioni inserite.
        </span>
        <div class="accordion accordion-solid accordion-toggle-plus" id="accordionExample6" style="padding-top: 2rem">
            {#if !inModal}
                <div class="card">
                    <div class="card-header" id="headingOne6">
                        <div class="card-title" data-toggle="collapse" data-target="#collapseOne6">
                            <i class="la la-user" /> Account Collegato
                        </div>
                    </div>
                    <div id="collapseOne6" class="collapse show" data-parent="#accordionExample6">
                        <div class="card-body">
                            <b>Verrà creato un nuovo account?</b>
                            {$newUserAccount.new_member ? 'Sì' : 'No'}
                            {#if $newUserAccount.newMember}
                                <div class="d-flex align-items-center fs-1-1">
                                    <span class="mt-3 mr-2 mb-0 ml-2 p-2 col-4">
                                        <b>Nome e Cognome:</b>
                                    </span>
                                    <span
                                        class="mt-3 mr-2 mb-0 ml-2 p-2 content-result"
                                        style="text-transform: capitalize">
                                        {$newUserAccount.newMemberInfo.first_name}
                                        {$newUserAccount.newMemberInfo.last_name}
                                    </span>
                                </div>
                                {#if $newUserAccount.newMemberInfo.phone != ''}
                                    <div class="d-flex align-items-center fs-1-1">
                                        <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                            <b>Telefono:</b>
                                        </span>
                                        <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                            {$newUserAccount.newMemberInfo.phone}
                                        </span>
                                    </div>
                                {/if}
                                <div class="d-flex align-items-center fs-1-1">
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                        <b>Email:</b>
                                    </span>
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                        {$newUserAccount.newMemberInfo.email}
                                    </span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
            <div class="card">
                <div class="card-header" id="headingTwo6">
                    <div class="card-title collapsed" data-toggle="collapse" data-target="#collapseTwo6">
                        <i class="la la-running" /> Informazioni Associato
                    </div>
                </div>
                <div id="collapseTwo6" class="collapse" data-parent="#accordionExample6">
                    <div class="card-body">
                        <div class="d-flex align-items-center fs-1-1">
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                <b>Nome e Cognome:</b>
                            </span>
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                {$newAssociate.associate_data.first_name}
                                {$newAssociate.associate_data.last_name}
                            </span>
                        </div>
                        <div class="d-flex align-items-center fs-1-1">
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                <b>Sesso:</b>
                            </span>
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                {$newAssociate.associate_data.sex}
                            </span>
                        </div>
                        <div class="d-flex align-items-center fs-1-1">
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                <b>Codice Fiscale:</b>
                            </span>
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: uppercase">
                                {$newAssociate.associate_data.tax_code}
                            </span>
                        </div>
                        <div class="d-flex align-items-center fs-1-1">
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                <b>Nato il:</b>
                            </span>
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                {$newAssociate.associate_data.born_date} <b style="text-transform: lowercase;">a</b>
                                {$newAssociate.associate_data.born_city}
                            </span>
                        </div>
                        <div class="d-flex align-items-center fs-1-1">
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                <b>Residente in:</b>
                            </span>
                            <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                {$newAssociate.associate_data.address} <b>-</b>
                                {$newAssociate.associate_data.address_city} ({$newAssociate.associate_data.address_cap})
                            </span>
                        </div>
                        {#if $newAssociate.associate_data.phone != ''}
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Telefono:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                    {$newAssociate.associate_data.phone}
                                </span>
                            </div>
                        {/if}
                        {#if $newAssociate.associate_data.email != ''}
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Email:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                    {$newAssociate.associate_data.email}
                                </span>
                            </div>
                        {/if}

                        {#if $newAssociate.associate_data.is_minor}
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-10 mr-2 mb-0 ml-2 p-2 col-12">
                                    <h4>Informazioni del tutore:</h4>
                                </span>
                            </div>

                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Nome e Cognome:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                    {$newAssociate.associate_tutor_data.first_name}
                                    {$newAssociate.associate_tutor_data.last_name}
                                </span>
                            </div>
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Sesso:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                    {$newAssociate.associate_tutor_data.sex}
                                </span>
                            </div>
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Codice Fiscale:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: uppercase">
                                    {$newAssociate.associate_tutor_data.tax_code}
                                </span>
                            </div>
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Nato il:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                    {$newAssociate.associate_tutor_data.born_date}
                                    <b style="text-transform: lowercase;">a</b>
                                    {$newAssociate.associate_tutor_data.born_city}
                                </span>
                            </div>
                            <div class="d-flex align-items-center fs-1-1">
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                    <b>Residente in:</b>
                                </span>
                                <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result" style="text-transform: capitalize">
                                    {$newAssociate.associate_tutor_data.address} <b>-</b>
                                    {$newAssociate.associate_tutor_data.address_city} ({$newAssociate
                                        .associate_tutor_data.address_cap})
                                </span>
                            </div>
                            {#if $newAssociate.associate_tutor_data.phone != ''}
                                <div class="d-flex align-items-center fs-1-1">
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                        <b>Telefono:</b>
                                    </span>
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                        {$newAssociate.associate_tutor_data.phone}
                                    </span>
                                </div>
                            {/if}
                            {#if $newAssociate.associate_tutor_data.email != ''}
                                <div class="d-flex align-items-center fs-1-1">
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 col-4">
                                        <b>Email:</b>
                                    </span>
                                    <span class="mt-0 mr-2 mb-0 ml-2 p-2 content-result">
                                        {$newAssociate.associate_tutor_data.email}
                                    </span>
                                </div>
                            {/if}
                        {/if}
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header" id="headingThree6">
                    <div class="card-title collapsed" data-toggle="collapse" data-target="#collapseThree6">
                        <i class="la la-signature" /> Anteprima della Firma
                    </div>
                </div>
                <div id="collapseThree6" class="collapse" data-parent="#accordionExample6">
                    <div class="card-body">
                        {#if $signature.there_is_signature}
                            <img src={$signature.data} style="padding: 2rem;width:100%" alt="firma inserita" />
                        {:else}
                            Nessuna firma inserita.
                        {/if}
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header" id="headingFour6">
                    <div class="card-title collapsed" data-toggle="collapse" data-target="#collapseFour6">
                        <i class="la la-briefcase-medical" /> Certificato Medico
                    </div>
                </div>
                <div id="collapseFour6" class="collapse" data-parent="#accordionExample6">
                    <div class="card-body">
                        {#if $medicalCertificate.medical_id}
                            Certificato medico <b>"{$medicalCertificate.filename}"</b> allegato all'iscrizione.
                            <br />
                            Il documento sarà valido fino al <b>{$medicalCertificate.certificate_expring_date}</b>.
                        {:else}
                            Nessun certificato medico aggiunto.
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
