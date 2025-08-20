<script>
    import {Datepicker, TextInput} from 'components/formBuilder/preview-blocks/index.js';

    export let formData;
    export const validationSchema = {
        'custom_data.school_name': {
            validators: {
                notEmpty: {
                    message: 'Il nome della scuola è obbligatorio.',
                },
            },
        },
        'custom_data.responsible_instructor_name': {
            validators: {
                notEmpty: {
                    message: "Il nome dell'istruttore responsabile è obbligatorio.",
                },
            },
        },
        'custom_data.school_teacher_name': {
            validators: {
                notEmpty: {
                    message: 'Il nome del maestro caposcuola è obbligatorio.',
                },
            },
        },
        'custom_data.principal_style': {
            validators: {
                notEmpty: {
                    message: 'Lo stile principale è obbligatorio.',
                },
            },
        },
    };
</script>

<h4 class="font-weight-bold text-dark wizard-title-info mt-12 mb-10">Scuola di Provenienza</h4>

<div class="form-group">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Scuola <b>*</b></label>
    <input
        bind:value={formData.custom_data.school_name}
        name="custom_data.school_name"
        type="text"
        class="form-control form-control-solid form-control-lg margin-tb-2"
        placeholder="Scuola"
        style="text-transform:capitalize" />
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Istruttore responsabile <b>*</b></label>
            <input
                bind:value={formData.custom_data.responsible_instructor_name}
                name="custom_data.responsible_instructor_name"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Istruttore responsabile"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Maestro caposcuola <b>*</b></label>
                <input
                    bind:value={formData.custom_data.school_teacher_name}
                    name="custom_data.school_teacher_name"
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Maestro caposcuola"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-xl-6">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>Grado (se posseduto)</label>
            <input
                bind:value={formData.custom_data.grade_if_available}
                name="custom_data.grade_if_available"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Grado (se posseduto)"
                style="text-transform:capitalize" />
        </div>
    </div>

    <div class="col-12 col-xl-6">
        <div class="form-group">
            <div class="form-group">
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>Stile principale <b>*</b></label>
                <input
                    bind:value={formData.custom_data.principal_style}
                    name="custom_data.principal_style"
                    type="text"
                    class="form-control form-control-solid form-control-lg margin-tb-2"
                    placeholder="Stile principale"
                    style="text-transform:capitalize" />
            </div>
        </div>
    </div>
</div>
