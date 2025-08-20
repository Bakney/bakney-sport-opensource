<script>
    import {userData} from 'store/stores';
    import {onMount} from 'svelte';
    import Select from 'svelte-select/Select.svelte';
    import {apiFetch} from 'utils/ApiMiddleware';

    userData.useLocalStorage();

    export let data = {
        first_name: '',
        last_name: '',
        email: '',
        born_date: null,
        born_city: '',
        born_province: '',
        tax_code: '',
        address_city: '',
        address: '',
        address_province: '',
        civic_number: '',
        study_title: '',
        role: 'Istruttore',
        phone: '',
        phone_2: '',
        phone_3: '',
        phone_4: '',
        associated_user_id: '',
        stipulated_contract_in: '',
        default_hourly_billing: 0,
        default_percentage_billing: 0,
    };
    export let inModal = false;

    let collaborators = [];

    onMount(async () => {
        collaborators = [];
        await apiFetch(__bakney.env.API.COLLABORATORS.LIST, {
            method: 'GET',
        }).then(res => {
            for (let i = 0; i < res.response.length; i++) {
                if (res.response[i].is_invite) continue;

                let label = (res.response[i].first_name || '') + ' ' + (res.response[i].last_name || '');
                if (label === ' ') {
                    alert('Collaboratore senza nome e cognome');
                    label = res.response[i].email;
                }
                collaborators = [
                    ...collaborators,
                    {
                        value: res.response[i].user_id,
                        label: label,
                    },
                ];
            }
        });
    });
</script>

<div>
    {#if !inModal}
        <h4 class="mb-10 font-weight-bold text-dark wizard-title-info">Inserisci le informazioni dell'Istruttore</h4>
    {/if}
    <div class="row">
        <div class="form-group col-12 col-md-4">
            <label for="first_name">Nome<b>*</b></label>
            <input
                placeholder="Inserisci il nome dell'istruttore"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                id="first_name"
                bind:value={data.first_name}
                name="first_name" />
        </div>
        <div class="form-group col-12 col-md-4">
            <label for="last_name">Cognome<b>*</b></label>
            <input
                placeholder="Inserisci il cognome dell'istruttore"
                type="text"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                id="last_name"
                bind:value={data.last_name}
                name="last_name" />
        </div>
        <div class="form-group col-12 col-md-4">
            <label for="email">Email<b>*</b></label>
            <input
                placeholder="Inserisci l'email dell'istruttore"
                type="email"
                class="form-control form-control-solid form-control-lg margin-tb-2"
                id="email"
                bind:value={data.email}
                name="email" />
        </div>
    </div>
    <h2 class="font-weight-bold text-dark mb-6">Informazioni anagrafiche</h2>
    <div class="row">
        <div class="form-group col-12 col-md-3">
            <label for="born_date">Data di nascita</label>
            <input
                id="born_date"
                name="born_date"
                type="date"
                bind:value={data.born_date}
                class="form-control form-control-solid form-control-lg"
                placeholder="Data di nascita" />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="born_city">Città di nascita</label>
            <input
                id="born_city"
                name="born_city"
                type="text"
                bind:value={data.born_city}
                class="form-control form-control-solid form-control-lg"
                placeholder="Città di nascita" />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="born_province">Provincia di nascita</label>
            <input
                id="born_province"
                name="born_province"
                type="text"
                bind:value={data.born_province}
                class="form-control form-control-solid form-control-lg"
                placeholder="Provincia di nascita" />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="tax_code">Codice fiscale</label>
            <input
                id="tax_code"
                name="tax_code"
                type="text"
                bind:value={data.tax_code}
                class="form-control form-control-solid form-control-lg"
                placeholder="Codice fiscale" />
        </div>
    </div>
    <div class="row">
        <div class="form-group col-12 col-md-3">
            <label for="address_city">Città di residenza</label>
            <input
                id="address_city"
                name="address_city"
                type="text"
                bind:value={data.address_city}
                class="form-control form-control-solid form-control-lg"
                placeholder="Città di residenza" />
        </div>
        <div class="form-group col-12 col-md-4">
            <label for="address">Indirizzo</label>
            <input
                id="address"
                name="address"
                type="text"
                bind:value={data.address}
                class="form-control form-control-solid form-control-lg"
                placeholder="Indirizzo di residenza" />
        </div>
        <div class="form-group col-12 col-md-2">
            <label for="civic_number">Civico</label>
            <input
                id="civic_number"
                name="civic_number"
                type="text"
                bind:value={data.civic_number}
                class="form-control form-control-solid form-control-lg"
                placeholder="Numero civico..." />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="address_province">Provincia di residenza</label>
            <input
                id="address_province"
                name="address_province"
                type="text"
                bind:value={data.address_province}
                class="form-control form-control-solid form-control-lg"
                placeholder="Provincia di residenza" />
        </div>

        <div class="form-group col-12 col-md-3">
            <label for="phone">Telefono</label>
            <input
                id="phone"
                name="phone"
                type="tel"
                bind:value={data.phone}
                class="form-control form-control-solid form-control-lg"
                placeholder="Nessun telefono" />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="phone_2">Telefono 2</label>
            <input
                id="phone_2"
                name="phone_2"
                type="tel"
                bind:value={data.phone_2}
                class="form-control form-control-solid form-control-lg"
                placeholder="Nessun telefono" />
        </div>
    </div>
    <h2 class="font-weight-bold text-dark my-6">Informazioni contratto (se applicabile)</h2>
    <div class="row">
        <div class="form-group col-12 col-md-3">
            <label for="is_volunteer">È un volontario</label>
            <div class="switch switch-sm switch-icon">
                <label>
                    <input type="checkbox" name="is_volunteer" bind:checked={data.is_volunteer} />
                    <span />
                </label>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="form-group col-12 col-md-3">
            <label for="stipulated_contract_in">Data stipula contratto</label>
            <input
                id="stipulated_contract_in"
                name="stipulated_contract_in"
                type="date"
                disabled={data.is_volunteer}
                bind:value={data.stipulated_contract_in}
                style="opacity: {data.is_volunteer ? 0.5 : 1};"
                class="form-control form-control-solid form-control-lg"
                placeholder="Inserisci la data di stipula del contratto" />
        </div>
        <div class="form-group col-12 col-md-4">
            <label for="study_title">Titolo di studio</label>
            <input
                id="study_title"
                name="study_title"
                type="text"
                bind:value={data.study_title}
                class="form-control form-control-solid form-control-lg"
                placeholder="Titolo di studio" />
        </div>
        <div class="form-group col-12 col-md-3">
            <label for="role">Ruolo</label>
            <input
                id="role"
                name="role"
                type="text"
                bind:value={data.role}
                class="form-control form-control-solid form-control-lg"
                placeholder="Ruolo" />
        </div>
    </div>
    <h2 class="font-weight-bold text-dark my-6">Altro</h2>
    <div class="row">
        <div class="form-group col-12">
            <label for="user_id">Account collaboratore associato</label>
            <Select
                hideEmptyState={true}
                id="associated_user_id"
                value={data.associated_user_id}
                on:change={e => {
                    data.associated_user_id = e.detail.value;
                }}
                on:clear={() => {
                    data.associated_user_id = null;
                }}
                bind:items={collaborators}
                placeholder="Seleziona l'account associato" />
            <small class="form-text text-info font-weight-bolder mt-2" style="font-size:1rem;"
                >Associandolo ad un collaboratore, questo vedrà solo se stesso.</small>
        </div>
    </div>
    {#if $userData.instructor_id == null}
        <div class="row mt-6">
            <div class="form-group col-12 col-md-6">
                <label for="default_hourly_billing">Tariffa oraria di default (€/ora)</label>
                <input
                    id="default_hourly_billing"
                    name="default_hourly_billing"
                    type="number"
                    bind:value={data.default_hourly_billing}
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Inserisci la tariffa oraria" />
            </div>
            <div class="form-group col-12 col-md-6">
                <label for="default_percentage_billing">Percentuale di default (%)</label>
                <input
                    id="default_percentage_billing"
                    name="default_percentage_billing"
                    type="number"
                    bind:value={data.default_percentage_billing}
                    class="form-control form-control-solid form-control-lg"
                    placeholder="Inserisci la percentuale di tariffa" />
            </div>
        </div>
    {/if}
    <input type="hidden" name="associated_user_id" bind:value={data.associated_user_id} />
</div>
