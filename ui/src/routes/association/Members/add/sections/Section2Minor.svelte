<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {newAssociate} from 'store/stores.js';
    newAssociate.useLocalStorage();

    export let configuration = {};

    function updateBornDateTutor(event) {
        if (event && event == 'focus') {
            $newAssociate.associate_tutor_data.born_date = null;
            newAssociate.set($newAssociate);
        }
    }

    jQuery(document).ready(function () {
        jQuery('#kt_datetimepicker_bornDate_tutor').datetimepicker({
            format: 'L',
            locale: 'it',
            useCurrent: false, // workaround the bug that maxDate overwrites defaultDate
            maxDate: moment(new Date(Date.now()), 'MM-DD-YYYY'),
            minDate: moment('01/01/1890', 'MM-DD-YYYY'),
            defaultDate: moment($newAssociate.associate_tutor_data.born_date, 'MM-DD-YYYY'),
        });

        jQuery('#kt_datetimepicker_bornDate_tutor').on('change.datetimepicker', function (e) {
            $newAssociate.associate_tutor_data.born_date = document.getElementById('date_input_born_date_tutor').value;
            newAssociate.set($newAssociate);
        });

        jQuery('#sexTutor').selectpicker();

        jQuery('#date_input_born_date_tutor').inputmask({
            mask: '99/99/9999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_tutor').inputmask({
            mask: '99999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap_tutor').change(function () {
            $newAssociate.associate_tutor_data.address_cap = document.getElementById('kt_inputmask_cap_tutor').value;
            newAssociate.set($newAssociate);
        });

        jQuery('#kt_inputmask_phone_tutor').inputmask({
            mask: '[+]999999999999999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_phone_tutor').change(function () {
            $newAssociate.associate_tutor_data.phone = document.getElementById('kt_inputmask_phone_tutor').value;
            newAssociate.set($newAssociate);
        });
    });
</script>

<!-- INFORMAZIONI TUTORE DEL MINORE-->
<div class="border-top mt-5 pt-10" style="display: {$newAssociate.associate_data.is_minor ? 'block' : 'none'}">
    <h3 class="mb-10 font-weight-bold text-dark wizard-title-info">Informazioni tutore del minorenne</h3>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Nome</label>
        <input
            bind:value={$newAssociate.associate_tutor_data.first_name}
            name="firstNameAssociateTutor"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Nome"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Cognome</label>
        <input
            bind:value={$newAssociate.associate_tutor_data.last_name}
            name="lastNameAssociateTutor"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Cognome"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci il cognome.</span> -->
    </div>

    <div class="row">
        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Codice Fiscale </label>
                <div class="d-flex align-items-center justify-content-between">
                    <input
                        bind:value={$newAssociate.associate_tutor_data.tax_code}
                        name="taxCodeAssociateTutor"
                        type="text"
                        class="form-control form-control-solid form-control-lg m-0"
                        placeholder="Codice fiscale"
                        style="text-transform:uppercase" />

                    <GenerateTaxCodeButton
                        bind:data={$newAssociate.associate_tutor_data}
                        on:codice={e => ($newAssociate.associate_tutor_data.tax_code = e.detail)} />
                </div>
                <!-- <span class="form-text text-muted">Per favore inserisci il codice fiscale.</span> -->
            </div>
        </div>

        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Sesso </label>
                <select
                    bind:value={$newAssociate.associate_tutor_data.sex}
                    name="sexAssociateTutor"
                    class="form-control selectpicker form-control-solid form-control-lg"
                    id="sexTutor">
                    <option value="F" data-icon="la la-venus font-size-lg bs-icon">Femmina</option>
                    <option value="M" data-icon="la la-mars font-size-lg bs-icon">Maschio</option>
                </select>
                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Data di Nascita </label>
                <div
                    class="input-group input-group-solid date"
                    id="kt_datetimepicker_bornDate_tutor"
                    data-target-input="nearest">
                    <input
                        bind:value={$newAssociate.associate_tutor_data.born_date}
                        on:focus={() => updateBornDateTutor('focus')}
                        id="date_input_born_date_tutor"
                        name="bornDateAssociateTutor"
                        type="text"
                        class="form-control form-control-solid form-control-lg datetimepicker-input"
                        placeholder="Seleziona Data"
                        data-target="#kt_datetimepicker_bornDate_tutor" />
                    <div
                        class="input-group-append"
                        data-target="#kt_datetimepicker_bornDate_tutor"
                        data-toggle="datetimepicker">
                        <span class="input-group-text">
                            <i class="ki ki-calendar" />
                        </span>
                    </div>
                </div>
                <!-- <span class="form-text text-muted">Per favore inserisci la data di nascita.</span> -->
            </div>
        </div>
        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Luogo di Nascita </label>
                <input
                    bind:value={$newAssociate.associate_tutor_data.born_city}
                    name="bornCityAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Luogo di Nascita"
                    style="text-transform:capitalize" />
                <!-- <span class="form-text text-muted">Per favore inserisci il luogo di nascita.</span> -->
            </div>
        </div>
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Indirizzo di Residenza, Numero </label>
        <input
            bind:value={$newAssociate.associate_tutor_data.address}
            id="addressAssociateTutor"
            name="addressAssociateTutor"
            type="text"
            class="form-control form-control-solid form-control-lg"
            placeholder="Indirizzo di Residenza, numero"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci Indirizzo di Residenza, numero.</span> -->
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Città di Residenza </label>
        <input
            bind:value={$newAssociate.associate_tutor_data.address_city}
            name="addressCityAssociateTutor"
            type="text"
            class="form-control form-control-solid form-control-lg"
            placeholder="Città di Residenza"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci la città di residenza.</span> -->
    </div>

    <div class="row">
        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Cap </label>
                <input
                    bind:value={$newAssociate.associate_tutor_data.address_cap}
                    name="capAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    id="kt_inputmask_cap_tutor"
                    placeholder="CAP di Residenza" />
                <!-- <span class="form-text text-muted">Per favore inserisci il CAP.</span> -->
            </div>
        </div>
        <div class="col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Cellulare {configuration?.mandatory_tutor_phone ? '*' : '(opzionale)'}</label>
                <input
                    bind:value={$newAssociate.associate_tutor_data.phone}
                    name="phoneAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    id="kt_inputmask_phone_tutor"
                    placeholder="Numero italiano" />
                <!-- <span class="form-text text-muted">Per favore inserisci il numero cellulare, sono validi solo numeri italiani.</span> -->
            </div>
        </div>
    </div>

    <!--begin::Input-->
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Email {configuration?.mandatory_tutor_email ? '*' : '(opzionale)'}</label>
        <input
            bind:value={$newAssociate.associate_tutor_data.email}
            name="emailAssociateTutor"
            type="email"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Inserisci un email..." />
        <!-- <span class="form-text text-muted">Per favore inserisci un indirizzo email.</span> -->
    </div>
    <!--end::Input-->
</div>
