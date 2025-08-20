<script>
    import {Datepicker, TextInput} from 'components/formBuilder/preview-blocks/index.js';

    export let formData;
    export const validationSchema = {
        'custom_data.denomination': {
            validators: {
                notEmpty: {
                    message: 'La denominazione è obbligatoria.',
                },
            },
        },
        'custom_data.city': {
            validators: {
                notEmpty: {
                    message: 'Il comune è obbligatorio.',
                },
            },
        },
        'custom_data.province': {
            validators: {
                notEmpty: {
                    message: 'La provincia è obbligatoria.',
                },
            },
        },
        'custom_data.address': {
            validators: {
                notEmpty: {
                    message: "L'indirizzo è obbligatorio.",
                },
            },
        },
        'custom_data.cap': {
            validators: {
                notEmpty: {
                    message: 'Il CAP è obbligatorio.',
                },
                maxLength: {
                    message: 'Il CAP deve contenere al massimo 8 caratteri.',
                },
            },
        },
        'custom_data.country': {
            validators: {
                notEmpty: {
                    message: 'La nazione è obbligatoria.',
                },
            },
        },
        'custom_data.tax_code': {
            validators: {
                notEmpty: {
                    message: 'Il codice fiscale è obbligatorio.',
                },
                stringLength: {
                    max: 20,
                    message: 'Il codice fiscale deve contenere al massimo 20 caratteri.',
                },
            },
        },
        'custom_data.phone': {
            validators: {
                stringLength: {
                    max: 20,
                    message: 'Il telefono deve contenere al massimo 20 caratteri.',
                },
            },
        },
        'custom_data.mobile_phone': {
            validators: {
                stringLength: {
                    max: 20,
                    message: 'Il telefono cellulare deve contenere al massimo 20 caratteri.',
                },
            },
        },
        'custom_data.email': {
            validators: {
                notEmpty: {
                    message: "L'email è obbligatoria.",
                },
                emailAddress: {
                    message: "L'email non è valida.",
                },
            },
        },
        'custom_data.technician_full_name': {
            validators: {
                stringLength: {
                    max: 255,
                    message: 'Il telefono cellulare deve contenere al massimo 255 caratteri.',
                },
            },
        },
        'custom_data.disciplines': {
            validators: {
                notEmpty: {
                    message: 'Le discipline insegnate sono obbligatorie.',
                },
            },
        },
    };
</script>

<h4 class="font-weight-bold text-dark wizard-title-info mt-12">Dati dell'associazione</h4>
<h6 class="mb-10">Inserisci tutte le informazioni richieste per proseguire.</h6>

<div class="form-group">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Denominazione <b>*</b></label>
    <input
        bind:value={formData.custom_data.denomination}
        name="custom_data.denomination"
        type="text"
        class="form-control form-control-solid form-control-lg margin-tb-2"
        placeholder="Denominazione"
        style="text-transform:capitalize" />
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Comune <b>*</b></label>
            <input
                bind:value={formData.custom_data.city}
                name="custom_data.city"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Comune"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Provincia <b>*</b></label>
                <input
                    bind:value={formData.custom_data.province}
                    name="custom_data.province"
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Provincia"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Via, Numero Civico <b>*</b></label>
            <input
                bind:value={formData.custom_data.address}
                name="custom_data.address"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Via, Numero Civico"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>CAP <b>*</b></label>
                <input
                    bind:value={formData.custom_data.cap}
                    name="custom_data.cap"
                    type="text"
                    maxlength="8"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="CAP"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Nazione <b>*</b></label>
            <input
                bind:value={formData.custom_data.country}
                name="custom_data.country"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Nazione"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Codice Fiscale (o Partita IVA) <b>*</b></label>
                <input
                    bind:value={formData.custom_data.tax_code}
                    name="custom_data.tax_code"
                    type="text"
                    maxlength="20"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Codice Fiscale (o Partita IVA)"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Telefono</label>
            <input
                bind:value={formData.custom_data.phone}
                name="custom_data.phone"
                type="tel"
                maxlength="20"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Telefono"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Telefono (celllulare)</label>
                <input
                    bind:value={formData.custom_data.mobile_phone}
                    name="custom_data.mobile_phone"
                    type="tel"
                    maxlength="20"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Telefono (celllulare)"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Email <b>*</b></label>
            <input
                bind:value={formData.custom_data.email}
                name="custom_data.email"
                type="email"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Email"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Nome e Cognome del tecnico</label>
                <input
                    bind:value={formData.custom_data.technician_full_name}
                    name="custom_data.technician_full_name"
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Nome e Cognome del tecnico"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Discipline insegnate <b>*</b></label>
            <textarea
                bind:value={formData.custom_data.disciplines}
                name="custom_data.disciplines"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Discipline insegnate..."
                style="text-transform:capitalize" />
        </div>
    </div>
</div>
