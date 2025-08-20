<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {Envelope, Phone, User} from 'phosphor-svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let info;
    export let index = 0;
</script>

<div class="d-flex justify-content-between align-items-center">
    <h1 class="text-dark font-weight-boldest my-8">Tutore {index + 2}</h1>
    <div>
        <button
            class="btn btn-sm btn-primary font-weight-bolder font-size-lg"
            type="button"
            on:click={() => dispatch('makeMainTutor', index)}>
            Rendi tutore principale
        </button>
        <!-- elimina -->
        <button
            class="btn btn-sm btn-light-danger font-weight-bolder font-size-lg ml-2"
            type="button"
            on:click={() => dispatch('removeTutor', index)}>
            Elimina
        </button>
    </div>
</div>

<div class="row">
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Nome</label>
            <input
                bind:value={info.associate.optional_tutors[index].first_name}
                name="firstNameAssociateTutor{index}"
                required
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Nome"
                style="text-transform:capitalize" />
        </div>
    </div>
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Cognome</label>
            <input
                bind:value={info.associate.optional_tutors[index].last_name}
                required
                name="lastNameAssociateTutor{index}"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Cognome"
                style="text-transform:capitalize" />
        </div>
    </div>
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Data di nascita</label>
            <input
                bind:value={info.associate.optional_tutors[index].born_date}
                name="bornDateAssociateTutor{index}"
                required
                type="date"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Data di nascita" />
        </div>
    </div>
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Città di nascita</label>
            <input
                bind:value={info.associate.optional_tutors[index].born_city}
                name="bornCityAssociateTutor{index}"
                required
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Città di nascita"
                style="text-transform:capitalize" />
        </div>
    </div>
    <div class="col-12 col-md-1">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Sesso</label>
            <select
                bind:value={info.associate.optional_tutors[index].sex}
                required
                name="sexAssociateTutor{index}"
                class="form-control form-control-solid form-control-lg margin-tb-2 p-4">
                <option value={'F'}>F</option>
                <option value={'M'}>M</option>
            </select>
        </div>
    </div>
    <div class="col-12 col-md-3">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Codice fiscale</label>
            <div class="d-flex mt-4 justify-content-between align-items-center">
                <input
                    bind:value={info.associate.optional_tutors[index].tax_code}
                    name="taxCodeAssociateTutor{index}"
                    required
                    type="text"
                    class="form-control form-control-solid form-control-lg m-0"
                    placeholder="Codice fiscale"
                    style="text-transform:uppercase" />
                <GenerateTaxCodeButton
                    bind:data={info.associate.optional_tutors[index]}
                    on:codice={e => (info.associate.optional_tutors[index].tax_code = e.detail)} />
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Città di Residenza</label>
            <input
                bind:value={info.associate.optional_tutors[index].address_city}
                name="addressCityAssociateTutor{index}"
                required
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Città di Residenza"
                style="text-transform:capitalize" />
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Indirizzo di residenza</label>
            <input
                bind:value={info.associate.optional_tutors[index].address}
                name="addressAssociateTutor{index}"
                required
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="Indirizzo di residenza"
                style="text-transform:capitalize" />
        </div>
    </div>
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">CAP</label>
            <input
                bind:value={info.associate.optional_tutors[index].address_cap}
                name="capAssociateTutor{index}"
                required
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                placeholder="CAP"
                style="text-transform:capitalize" />
        </div>
    </div>
</div>

<h3 class="text-dark font-weight-boldest my-4">Informazioni di contatto</h3>
<div class="row">
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder mb-4">Telefono</label>
            <div class="input-group input-group-lg input-group-solid">
                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone}
                    name="phoneAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_label}
                    name="phoneLabelAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nome contatto" />
            </div>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder mb-4">Telefono 2</label>
            <div class="input-group input-group-lg input-group-solid">
                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_2}
                    name="phone2AssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_2_label}
                    name="phone2LabelAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nome contatto" />
            </div>
        </div>
    </div>

    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder mb-4">Telefono 3</label>
            <div class="input-group input-group-lg input-group-solid">
                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_3}
                    name="phone3AssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_3_label}
                    name="phone3LabelAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nome contatto" />
            </div>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder mb-4">Telefono 4</label>
            <div class="input-group input-group-lg input-group-solid">
                <Phone size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_4}
                    name="phone4AssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].phone_4_label}
                    name="phone4LabelAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nome contatto" />
            </div>
        </div>
    </div>
    <div class="col-12 col-md-4">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder mb-4">Email</label>
            <div class="input-group input-group-lg input-group-solid">
                <Envelope size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.optional_tutors[index].email}
                    name="emailAssociateTutor{index}"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessuna email" />
            </div>
        </div>
    </div>
</div>
