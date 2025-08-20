<script>
    import GenerateTaxCodeButton from 'components/buttons/GenerateTaxCodeButton.svelte';
    import {Envelope, Phone, User} from 'phosphor-svelte';

    export let info;
</script>

<h1 class="text-dark font-weight-boldest my-8">Tutore principale</h1>

<div class="row">
    <div class="col-12 col-md-2">
        <div class="form-group">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="font-weight-bolder">Nome</label>
            <input
                bind:value={info.associate.tutor.first_name}
                name="firstNameAssociateTutor"
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
                bind:value={info.associate.tutor.last_name}
                name="lastNameAssociateTutor"
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
                bind:value={info.associate.tutor.born_date}
                name="bornDateAssociateTutor"
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
                bind:value={info.associate.tutor.born_city}
                name="bornCityAssociateTutor"
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
                bind:value={info.associate.tutor.sex}
                name="sexAssociateTutor"
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
                    bind:value={info.associate.tutor.tax_code}
                    name="taxCodeAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg m-0"
                    placeholder="Codice fiscale"
                    style="text-transform:uppercase" />
                <GenerateTaxCodeButton
                    bind:data={info.associate.tutor}
                    on:codice={e => (info.associate.tutor.tax_code = e.detail)} />
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
                bind:value={info.associate.tutor.address_city}
                name="addressCityAssociateTutor"
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
                bind:value={info.associate.tutor.address}
                name="addressAssociateTutor"
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
                bind:value={info.associate.tutor.address_cap}
                name="capAssociateTutor"
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
                    bind:value={info.associate.tutor.phone}
                    name="phoneAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.tutor.phone_label}
                    name="phoneLabelAssociateTutor"
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
                    bind:value={info.associate.tutor.phone_2}
                    name="phone2AssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.tutor.phone_2_label}
                    name="phone2LabelAssociateTutor"
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
                    bind:value={info.associate.tutor.phone_3}
                    name="phone3AssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.tutor.phone_3_label}
                    name="phone3LabelAssociateTutor"
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
                    bind:value={info.associate.tutor.phone_4}
                    name="phone4AssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessun telefono" />
                <User size="16" weight="duotone" class="mx-4 text-dark-25" />
                <input
                    bind:value={info.associate.tutor.phone_4_label}
                    name="phone4LabelAssociateTutor"
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
                    bind:value={info.associate.tutor.email}
                    name="emailAssociateTutor"
                    type="text"
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Nessuna email" />
            </div>
        </div>
    </div>
</div>
