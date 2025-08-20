<script>
    import {Plus, TrashSimple} from 'phosphor-svelte';
    import FiscalRegimeSelect from './FiscalRegimeSelect.svelte';
    import PaymentConditionSelect from './PaymentConditionSelect.svelte';
    import PaymentModalitiesSelect from './PaymentModalitiesSelect.svelte';
    import {userData} from 'store/stores';
    import ImportModal from './ImportModal.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';

    userData.useLocalStorage();

    export let lines = [{description: '', quantity: 1, unit_price: 0.0, vat: 22.0, unit_of_measure: 'unità'}];
    export let payment_total_amount = 0.0;
    let vat_included = false;
    let formData = {
        prefix: 'FPR',
        number: '',
        fiscal_year: '',
        assignor_prefix_vat_number: 'IT',
        // ... add all other individual form fields here
    };

    let transferor = {
        prefix_vat_number: 'IT',
        vat_number: '',
        tax_code: '',
        fiscal_regime: '',
        denomination: '',
        address: '',
        address_cap: '',
        address_city: '',
        address_province: '',
        address_country: 'IT',
        contact_email: '',
        contact_phone: '',
        contact_fax: '',
    };

    $: {
        if (vat_included) {
            payment_total_amount = lines.reduce((acc, line) => acc + line.quantity * line.unit_price, 0);
        } else {
            payment_total_amount = lines.reduce(
                (acc, line) => acc + line.quantity * line.unit_price * (1 + line?.vat / 100),
                0
            );
        }
    }

    const addLine = () => {
        lines = [...lines, {description: '', quantity: 1, unit_price: 0.0, vat: 22.0, unit_of_measure: 'unità'}];
    };

    const removeLine = index => {
        lines = lines.filter((line, i) => i !== index);
    };

    const getTransferorDetails = async details => {
        let transferorDetails = {};
        // check groupItem and make an api call to get the details
        if (details.group === 'Fornitori') {
            let res = await apiFetch(replaceUID(`${__bakney.env.API.SUPPLIER.INFO}`, details.value));
            const data = res.response.data;
            transferorDetails = {
                prefix_vat_number: 'IT',
                vat_number: data.vat_number || '',
                tax_code: data.tax_code || '',
                fiscal_regime: '',
                denomination: data.name || '',
                address: data.address || '',
                address_cap: data.cap || '',
                address_city: data.city || '',
                address_province: data.state || '',
                address_country: data.country || 'IT',
                contact_email: data.email || '',
                contact_phone: data.phone_number || '',
                contact_fax: '',
            };
        } else if (details.group === 'Istruttori') {
            let res = await apiFetch(replaceUID(`${__bakney.env.API.INSTRUCTOR.INFO}`, details.value));
            const data = res.response.data;
            transferorDetails = {
                prefix_vat_number: 'IT',
                vat_number: '',
                tax_code: data.tax_code || '',
                fiscal_regime: '',
                denomination: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                address: data.address || '',
                address_cap: '',
                address_city: data.address_city || '',
                address_province: data.address_province || '',
                address_country: 'IT',
                contact_email: data.email || '',
                contact_phone: data.phone || '',
                contact_fax: '',
            };
        } else if (details.group === 'Persone') {
            let res = await apiFetch(replaceUID(`${__bakney.env.API.PERSONAS.INFO}`, details.value));
            const data = res.response;
            transferorDetails = {
                prefix_vat_number: 'IT',
                vat_number: '', // Personas typically don't have VAT numbers
                tax_code: data.tax_code || '',
                fiscal_regime: '',
                denomination: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                address: data.address || '',
                address_cap: data.address_cap || '',
                address_city: data.address_city || '',
                address_province: '', // Not available in persona data
                address_country: 'IT',
                contact_email: data.email || '',
                contact_phone: data.phone || '',
                contact_fax: '',
            };
        }

        return transferorDetails;
    };
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="row p-0">
    <div class="col-12">
        <div class="row mb-0">
            <div class="mb-0 form-group col-6 col-md-1">
                <label>Paese</label>
                <input
                    disabled
                    name="country_transmitter_prefix"
                    type="text"
                    value="IT"
                    class="opacity-50 form-control form-control-solid form-control-sm margin-t-2"
                    placeholder="" />
            </div>
            <div class="mb-0 form-group col-6 col-md-1">
                <label>Formato</label>
                <input
                    name="transmitting_format"
                    type="text"
                    disabled
                    value="FPR12"
                    class="opacity-50 form-control form-control-solid form-control-sm margin-t-2"
                    placeholder="Formato fattura" />
            </div>
            <div class="mb-0 form-group col-6 col-md-1">
                <label>Tipo</label>
                <input
                    name="document_type"
                    type="text"
                    disabled
                    value="TD01"
                    class="opacity-50 form-control form-control-solid form-control-sm margin-t-2"
                    placeholder="Tipo fattura" />
            </div>
            <div class="mb-0 form-group col-6 col-md-1">
                <label>Valuta</label>
                <input
                    name="currency"
                    type="text"
                    disabled
                    value="EUR"
                    class="opacity-50 form-control form-control-solid form-control-sm margin-t-2"
                    placeholder="Valuta fattura" />
            </div>
            <div class="mb-0 form-group col-md-2">
                <label>SDI</label>
                <input
                    name="id_transmitter"
                    type="text"
                    value="0000000"
                    class="form-control form-control-solid form-control-sm margin-t-2"
                    placeholder="Identificativo SDI" />
            </div>
            <div class="mb-0 form-group col-md-2">
                <label>Data Fattura</label>
                <input
                    name="transmitting_date"
                    type="date"
                    value={new Date()}
                    class="form-control form-control-solid form-control-sm margin-t-2" />
            </div>
        </div>
    </div>
</div>
<hr class="mt-4" />
<div class="row p-0">
    <div class="form-group col-3 col-md-2 mx-1 mb-0 pr-0">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Prefisso</label>
        <input
            name="prefix"
            type="text"
            value="FPR"
            class="form-control form-control-solid form-control-sm margin-t-2"
            placeholder="" />
        <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
    </div>
    <div class="form-group col-3 col-md-2 mx-1 mb-0 px-0">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Numero</label>
        <input
            name="number"
            type="number"
            value="1"
            class="form-control form-control-solid form-control-sm margin-t-2"
            placeholder="Numero" />
        <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
    </div>
    <div class="form-group col-3 col-md-2 mx-1 mb-0 px-0">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Anno</label>
        <input
            name="fiscal_year"
            type="number"
            digits="2"
            value={new Date().getFullYear().toString().slice(-2)}
            class="form-control form-control-solid form-control-sm margin-t-2"
            placeholder="Numero fattura" />
        <!-- <span class="form-text text-muted">Per favore inserisci il nome.</span> -->
    </div>
</div>
<hr class="mt-4" />
<div class="row p-0">
    <div class="col-12 col-md-6">
        <div class="row px-0 py-2">
            <div class="col-12">
                <h4 class="mb-8">Cedente Prestatore (Azienda)</h4>
                <div class="row">
                    <div class="form-group mb-2 col-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            value="IT"
                            name="assignor_prefix_vat_number"
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="IT" />
                    </div>
                    <div class="form-group mb-2 col-10">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_vat_number"
                            value={$userData?.sport_association?.vat_number}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Partita IVA" />
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-8 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_tax_code"
                            value={$userData?.sport_association?.tax_code}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Codice fiscale" />
                    </div>
                    <div class="form-group mb-2 col-4">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <FiscalRegimeSelect name="assignor_fiscal_regime" />
                    </div>
                </div>
                <div class="form-group mb-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <input
                        type="text"
                        name="assignor_denomination"
                        value={$userData?.sport_association?.denomination}
                        class="form-control form-control-sm form-control-solid mb-0"
                        placeholder="Denominazione" />
                </div>
                <hr class="mt-4" />
                <h6 class="font-weight-bold font-size-h6 mb-4">Sede legale</h6>
                <div class="row">
                    <!-- cols:  assignor_address assignor_postal_code -->
                    <div class="form-group mb-2 col-8">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_address"
                            value={$userData?.sport_association?.address}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Indirizzo" />
                    </div>

                    <div class="form-group mb-2 col-4">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_postal_code"
                            value={$userData?.sport_association?.address_cap}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="CAP" />
                    </div>
                </div>
                <div class="row">
                    <!-- cols: assignor_city assignor_province assignor_country -->
                    <div class="form-group mb-2 col-6">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_city"
                            value={$userData?.sport_association?.address_city}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Città" />
                    </div>
                    <div class="form-group mb-2 col-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_province"
                            value=""
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Provincia" />
                    </div>
                    <div class="form-group mb-2 col-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_country"
                            value="IT"
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Paese" />
                    </div>
                </div>
                <hr class="mt-4" />
                <h6 class="font-weight-bold font-size-h6 mb-4">Contatti</h6>
                <div class="row">
                    <!-- rows: assignor_contact_email, assignor_contact_phone, assignor_fax -->
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_contact_email"
                            value={$userData?.email}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Email" />
                    </div>
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_contact_phone"
                            value={$userData?.phone}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Telefono" />
                    </div>
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="assignor_fax"
                            value=""
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Fax" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-6">
        <div class="row px-0 py-2">
            <div class="col-12">
                <div class="row px-4 flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-4">Cessionario Committente (Cliente)</h4>
                    <button
                        type="button"
                        class="btn btn-sm btn-primary font-weight-bolder m-0"
                        on:click={() => {
                            let importModal = new ImportModal({
                                target: document.querySelector(`#portal-elements-foreground`),
                                props: {
                                    show: true,
                                },
                            });
                            importModal.$on('import', async e => {
                                const transferorDetails = await getTransferorDetails(e.detail);
                                // update only the transferor fields
                                for (let key in transferorDetails) {
                                    if (key in transferor) {
                                        transferor[key] = transferorDetails[key];
                                    }
                                }
                            });
                        }}>
                        <Plus size="16" weight="duotone" class="mr-1" />
                        Importa
                    </button>
                </div>
                <div class="row">
                    <div class="form-group mb-2 col-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            value="IT"
                            name="transferor_prefix_vat_number"
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="IT" />
                    </div>
                    <div class="form-group mb-2 col-10">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_vat_number"
                            bind:value={transferor.vat_number}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Partita IVA" />
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-8 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_tax_code"
                            bind:value={transferor.tax_code}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Codice fiscale" />
                    </div>
                    <div class="form-group mb-2 col-4">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <FiscalRegimeSelect name="transferor_fiscal_regime" />
                    </div>
                </div>
                <div class="form-group mb-2">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <input
                        type="text"
                        name="transferor_denomination"
                        bind:value={transferor.denomination}
                        class="form-control form-control-sm form-control-solid mb-0"
                        placeholder="Denominazione" />
                </div>
                <hr class="mt-4" />
                <h6 class="font-weight-bold font-size-h6 mb-4">Sede legale</h6>
                <div class="row">
                    <!-- cols:  transferor_address transferor_postal_code -->
                    <div class="form-group mb-2 col-8">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_address"
                            bind:value={transferor.address}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Indirizzo" />
                    </div>

                    <div class="form-group mb-2 col-4">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_postal_code"
                            bind:value={transferor.address_cap}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="CAP" />
                    </div>
                </div>
                <div class="row">
                    <!-- cols: transferor_city transferor_province transferor_country -->
                    <div class="form-group mb-2 col-6">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_city"
                            bind:value={transferor.address_city}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Città" />
                    </div>
                    <div class="form-group mb-2 col-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_province"
                            bind:value={transferor.address_province}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Provincia" />
                    </div>
                    <div class="form-group mb-2 col-3">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_country"
                            value="IT"
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Paese" />
                    </div>
                </div>
                <hr class="mt-4" />
                <h6 class="font-weight-bold font-size-h6 mb-4">Contatti</h6>
                <div class="row">
                    <!-- rows: transferor_contact_email, transferor_contact_phone, transferor_fax -->
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_contact_email"
                            bind:value={transferor.contact_email}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Email" />
                    </div>
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_contact_phone"
                            bind:value={transferor.contact_phone}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Telefono" />
                    </div>
                    <div class="form-group col-12 col-md-4 mb-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <input
                            type="text"
                            name="transferor_fax"
                            bind:value={transferor.contact_fax}
                            class="form-control form-control-sm form-control-solid mb-0"
                            placeholder="Fax" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<hr class="mt-4" />
<h4 class="mb-2">Linee prodotti</h4>
<!-- <h6 class="font-weight-light font-size-h6 mb-4">Inserire i prodotti da aggiungere in fattura.</h6> -->
<!-- Toggle to switch between VAT included and not -->
<div class="form-group d-flex justify-content-start align-items-baseline">
    <div class="d-flex align-items-center">
        <span class="switch switch-solid switch-icon switch-light-primary switch-sm">
            <label>
                <input type="checkbox" bind:checked={vat_included} name="vat_included" />
                <span />
            </label>
        </span>
        <span class="ml-2 font-weight-bold">gli importi includono già l'IVA</span>
    </div>
</div>
<!-- Dynamic Lines Section -->
{#each lines as line, index (index)}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <div class="p-2 md:p-4">
        <div class="row mb-0 flex justify-content-between">
            <div class="mb-0 px-2 form-group col-md-6">
                <label class="font-weight-bold" style="font-size:.9rem;">Descrizione prodotto {index + 1}</label>
                <input
                    type="text"
                    bind:value={line.description}
                    class="form-control form-control-solid form-control-sm"
                    placeholder="Descrizione prodotto" />
            </div>
            <div class="mb-0 px-2 form-group col-6 col-md-1" style="max-width: fit-content;">
                <label class="font-weight-bold" style="font-size:.9rem;">Quantità</label>
                <input
                    type="number"
                    bind:value={line.quantity}
                    class="form-control form-control-solid form-control-sm"
                    placeholder="Quantità" />
            </div>
            <div class="mb-0 px-2 form-group col-6 col-md-2">
                <label class="font-weight-bold" style="font-size:.9rem;">Prezzo</label>
                <div class="d-flex align-items-baseline">
                    <input
                        type="number"
                        step="0.01"
                        bind:value={line.unit_price}
                        class="form-control form-control-solid form-control-sm"
                        placeholder="Tipo unità" />
                    <span class="ml-2">€</span>
                </div>
            </div>
            <div class="mb-0 px-2 form-group col-6 col-md-1">
                <label class="font-weight-bold" style="font-size:.9rem;">Unità</label>
                <input
                    type="text"
                    bind:value={line.unit_of_measure}
                    class="form-control form-control-solid form-control-sm"
                    placeholder="Unità di misura" />
            </div>
            <div class="mb-0 px-2 form-group col-6 col-md-1">
                <label class="font-weight-bold" style="font-size:.9rem;">Aliquota IVA</label>
                <div class="d-flex align-items-baseline">
                    <input
                        type="number"
                        bind:value={line.vat}
                        class="form-control form-control-solid form-control-sm"
                        placeholder="Aliquota IVA" />
                    <span class="ml-2">%</span>
                </div>
            </div>
            <div
                class="mb-0 px-2 form-group col-6 col-md-1 d-flex flex-column align-items-end justify-content-end"
                style="max-width: fit-content;">
                <button
                    disabled={index == 0}
                    type="button"
                    on:click={() => removeLine(index)}
                    class="btn btn-sm btn-light-danger"><TrashSimple weight="duotone" size="15" /></button>
            </div>
        </div>
    </div>
{/each}

<div class="form-group d-flex justify-content-end align-items-baseline mt-2">
    <button
        type="button"
        on:click={addLine}
        class="btn btn-primary btn-sm mb-0 font-weight-bold d-flex align-items-center"
        ><Plus size="16" weight="duotone" class="mr-1" /> Prodotto</button>
</div>
<hr class="mt-4" />
<div class="d-flex flex-column justify-content-end">
    <!-- show recalculation including VAT amount -->
    {#each Array.from(lines) as line}
        {#if line.quantity && line.unit_price && line.vat}
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="font-size-sm">
                    <span class="">{line.description}</span>
                    {line.quantity} x
                    {new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                    }).format(line.unit_price)}/{line.unit_of_measure}
                </div>
                <div class="font-size-md">
                    {#if vat_included}
                        {new Intl.NumberFormat('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                        }).format(line.quantity * line.unit_price)}
                    {:else}
                        {new Intl.NumberFormat('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                        }).format(line.quantity * line.unit_price * (1 + line.vat / 100))}
                    {/if}
                </div>
            </div>
        {/if}
    {/each}
</div>
<!-- Imponibile: total_payment_amount - VAT -->

<div class="d-flex justify-content-end">
    <h2 class="font-size-h6 font-weight-bold">
        <span class=" mr-2"> IMPONIBILE </span>
        <span>
            {#if vat_included}
                {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(lines.reduce((partialSum, line) => partialSum + line?.quantity * line?.unit_price, 0) || '0')}
            {:else}
                {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(lines.reduce((partialSum, line) => partialSum + line?.quantity * line?.unit_price, 0) || '0')}
            {/if}
        </span>
    </h2>
</div>
<div class="d-flex justify-content-end">
    <h2 class="font-size-h6 font-weight-bold">
        <span class=" mr-2"> IVA </span>
        <span>
            {#if vat_included}
                {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(
                    lines.reduce(
                        (partialSum, line) =>
                            partialSum +
                            line?.quantity * line?.unit_price * (1 + line?.vat / 100) -
                            line?.quantity * line?.unit_price,
                        0
                    ) || '0'
                )}
            {:else}
                {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(
                    lines.reduce(
                        (partialSum, line) =>
                            partialSum +
                            line?.quantity * line?.unit_price * (1 + line?.vat / 100) -
                            line?.quantity * line?.unit_price,
                        0
                    ) || '0'
                )}
            {/if}
        </span>
    </h2>
</div>
<div class="d-flex justify-content-end">
    <h2 class="font-size-h1 font-weight-boldest">
        <span class="font-size-sm mr-2"> TOTALE FATTURA </span>
        <span>
            {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR',
            }).format(payment_total_amount || '0')}
        </span>
    </h2>
</div>

<hr class="mt-4" />
<h4 class="mb-4">Pagamento</h4>
<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="row">
    <div class="col-12">
        <div class="row">
            <div class="col-4">
                <PaymentModalitiesSelect />
            </div>
            <div class="col-4">
                <PaymentConditionSelect />
            </div>
            <div class="col-4">
                <!-- payment_expiry_date -->
                <div class="form-group mb-0">
                    <label>Data Scadenza</label>
                    <input
                        name="payment_expiry_date"
                        type="date"
                        value={new Date()}
                        class="form-control form-control-solid form-control-sm margin-t-2" />
                </div>
            </div>
        </div>
    </div>
    <div class="col-12">
        <div class="form-group mb-0">
            <label>Causale</label>
            <textarea
                name="causal"
                type="text"
                value=""
                class="form-control form-control-solid form-control-sm margin-t-2"
                placeholder="Causale fattura" />
        </div>
    </div>
</div>

<input hidden bind:value={payment_total_amount} name="payment_total_amount" />
