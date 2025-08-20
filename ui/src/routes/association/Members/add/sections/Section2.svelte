<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {newAssociate} from 'store/stores.js';
    import Section2Minor from './Section2Minor.svelte';
    import {getBornCity, getBornDate, getSex} from 'utils/TaxCode';
    import Datepicker from 'components/formBuilder/preview-blocks/datepicker-input.svelte';
    import {updateIsMinor} from 'utils/Functions.js';

    export let isModal = false;
    export let configuration = {};

    newAssociate.useLocalStorage();
    let checkingOn = true;
    let checkingOnTutor = true;

    $: $newAssociate.associate_data.tax_code, checkTaxCode();
    $: $newAssociate.associate_tutor_data.tax_code, checkTaxCodeTutor();

    function updateBornDate(event) {
        if (event && event == 'focus') {
            $newAssociate.associate_data.born_date = null;
            newAssociate.set($newAssociate);
        }
    }

    jQuery(document).ready(function () {
        jQuery('#sex').selectpicker();

        jQuery('#kt_inputmask_cap').inputmask({
            mask: '99999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_cap').change(function () {
            $newAssociate.associate_data.address_cap = document.getElementById('kt_inputmask_cap').value;
            newAssociate.set($newAssociate);
            // dispatch input event for validation
            let input = document.getElementById('kt_inputmask_cap');
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });

        jQuery('#kt_inputmask_phone').inputmask({
            mask: '[+]999999999999999',
            placeholder: '', // remove underscores from the input mask
        });

        jQuery('#kt_inputmask_phone').change(function () {
            $newAssociate.associate_data.phone = document.getElementById('kt_inputmask_phone').value;
            newAssociate.set($newAssociate);
        });
    });

    function checkTaxCodeValidty(taxCode) {
        return /^(?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i.test(
            taxCode
        );
    }

    function checkTaxCode() {
        if (
            String($newAssociate.associate_data.tax_code).length == 16 &&
            checkTaxCodeValidty($newAssociate.associate_data.tax_code) &&
            checkingOn == true
        ) {
            let extractedSex = String(getSex($newAssociate.associate_data.tax_code) || '').trim();
            let extractedBornCity = String(getBornCity($newAssociate.associate_data.tax_code) || '').trim();
            let extractedBornDate = String(getBornDate($newAssociate.associate_data.tax_code) || '').trim();
            if (extractedSex != '') {
                $newAssociate.associate_data.sex = extractedSex;
                setTimeout(() => jQuery('#sex').selectpicker('refresh'), 500);
            }
            if (extractedBornCity != '') {
                $newAssociate.associate_data.born_city = extractedBornCity;
            }
            if (extractedBornDate != '') {
                $newAssociate.associate_data.born_date = extractedBornDate;
                $newAssociate.associate_data.is_minor = isMinor($newAssociate.associate_data.born_date);
            }
            checkingOn = false;
        } else if (String($newAssociate.associate_data.tax_code).length < 16) {
            checkingOn = true;
        }
    }

    function checkTaxCodeTutor() {
        if (
            String($newAssociate.associate_tutor_data.tax_code).length == 16 &&
            checkTaxCodeValidty($newAssociate.associate_tutor_data.tax_code) &&
            checkingOnTutor == true
        ) {
            let extractedSex = String(getSex($newAssociate.associate_tutor_data.tax_code) || '').trim();
            let extractedBornCity = String(getBornCity($newAssociate.associate_tutor_data.tax_code) || '').trim();
            let extractedBornDate = String(getBornDate($newAssociate.associate_tutor_data.tax_code) || '').trim();
            if (extractedSex != '') {
                $newAssociate.associate_tutor_data.sex = extractedSex;
                setTimeout(() => jQuery('#sexTutor').selectpicker('refresh'), 500);
            }
            if (extractedBornCity != '') {
                $newAssociate.associate_tutor_data.born_city = extractedBornCity;
            }
            if (extractedBornDate != '') {
                $newAssociate.associate_tutor_data.born_date = extractedBornDate;
            }
            checkingOnTutor = false;
        } else if (String($newAssociate.associate_tutor_data.tax_code).length < 16) {
            checkingOnTutor = true;
        }
    }

    const isMinor = function (input) {
        let date = moment(input, 'DD/MM/YYYY');
        let now = moment();
        let years = now.diff(date, 'years');
        return years < 18;
    };
</script>

<div class="pb-5" data-wizard-type="step-content">
    {#if !isModal}
        <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Inserisci le informazioni dell'Associato</h4>
    {/if}
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Nome <b>*</b></label>
        <input
            bind:value={$newAssociate.associate_data.first_name}
            name="firstNameAssociate"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Nome"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
    </div>
    <!--end::Input-->
    <!--begin::Input-->
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Cognome <b>*</b></label>
        <input
            bind:value={$newAssociate.associate_data.last_name}
            name="lastNameAssociate"
            type="text"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Cognome"
            style="text-transform:capitalize" />
        <!-- <span class="form-text text-muted">Per favore inserisci il cognome.</span> -->
    </div>

    <div class="row">
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Codice Fiscale <b>*</b></label>
                <div class="d-flex align-items-center justify-content-between">
                    <input
                        bind:value={$newAssociate.associate_data.tax_code}
                        name="taxCodeAssociate"
                        maxlength="16"
                        type="text"
                        class="form-control form-control-solid form-control-lg m-0"
                        placeholder="Codice fiscale"
                        style="text-transform:uppercase" />

                    <GenerateTaxCodeButton
                        bind:data={$newAssociate.associate_data}
                        on:codice={e => ($newAssociate.associate_data.tax_code = e.detail)} />
                </div>
                <!-- <span class="form-text text-muted">Per favore inserisci il codice fiscale.</span> -->
            </div>
        </div>
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Sesso <b>*</b></label>
                <select
                    bind:value={$newAssociate.associate_data.sex}
                    name="sexAssociate"
                    class="form-control selectpicker form-control-solid form-control-lg"
                    id="sex">
                    <option value="F" data-icon="la la-venus font-size-lg bs-icon">Femmina</option>
                    <option value="M" data-icon="la la-mars font-size-lg bs-icon">Maschio</option>
                </select>
                <!-- <span class="form-text text-muted">Per favore inserisci il sesso.</span> -->
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <Datepicker
                    customClasses={'p-0 m-0'}
                    editable={false}
                    active={false}
                    on:keyup={e => {
                        $newAssociate.associate_data.born_date = e.detail;
                        newAssociate.set(updateIsMinor($newAssociate, 'date_input_born_date', __bakney.env.DEBUG));
                    }}
                    props={{
                        id: 'date_input_born_date',
                        name: 'bornDateAssociate',
                        label: 'Data di Nascita',
                        placeholder: 'Seleziona data',
                        format: 'DD/MM/YYYY',
                        required: true,
                        value: $newAssociate.associate_data.born_date,
                    }} />
            </div>
        </div>
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Luogo di Nascita <b>*</b></label>
                <input
                    bind:value={$newAssociate.associate_data.born_city}
                    name="bornCityAssociate"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Luogo di Nascita"
                    style="text-transform: capitalize;" />
                <!-- <span class="form-text text-muted">Per favore inserisci il luogo di nascita.</span> -->
            </div>
        </div>
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Indirizzo di Residenza, Numero <b>*</b></label>
        <input
            bind:value={$newAssociate.associate_data.address}
            name="addressAssociate"
            type="text"
            class="form-control form-control-solid form-control-lg"
            placeholder="Indirizzo di Residenza, numero"
            style="text-transform: capitalize;" />
        <!-- <span class="form-text text-muted">Per favore inserisci Indirizzo di Residenza, numero.</span> -->
    </div>

    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Città di Residenza <b>*</b></label>
        <input
            bind:value={$newAssociate.associate_data.address_city}
            name="addressCityAssociate"
            type="text"
            class="form-control form-control-solid form-control-lg"
            placeholder="Città di Residenza"
            style="text-transform: capitalize;" />
        <!-- <span class="form-text text-muted">Per favore inserisci la città di residenza.</span> -->
    </div>

    <div class="row">
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Cap <b>*</b></label>
                <input
                    bind:value={$newAssociate.associate_data.address_cap}
                    name="capAssociate"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    id="kt_inputmask_cap"
                    placeholder="CAP di Residenza" />
                <!-- <span class="form-text text-muted">Per favore inserisci il CAP.</span> -->
            </div>
        </div>
        <div class="col-12 col-xl-6">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Cellulare {configuration?.mandatory_phone ? '*' : '(opzionale)'}</label>
                <input
                    bind:value={$newAssociate.associate_data.phone}
                    name="phoneAssociate"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    id="kt_inputmask_phone"
                    placeholder="Numero di telefono" />
                <!-- <span class="form-text text-muted">Per favore inserisci il numero cellulare, sono validi solo numeri italiani.</span> -->
            </div>
        </div>
    </div>

    <!--begin::Input-->
    <div class="form-group">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Email {configuration?.mandatory_email ? '*' : '(opzionale)'}</label>
        <input
            bind:value={$newAssociate.associate_data.email}
            name="emailAssociate"
            type="email"
            class="form-control form-control-solid form-control-lg margin-tb-2"
            placeholder="Inserisci un'email..." />
        <!-- <span class="form-text text-muted">Per favore inserisci un indirizzo email.</span> -->
    </div>
    <!--end::Input-->

    <Section2Minor bind:configuration />
</div>
