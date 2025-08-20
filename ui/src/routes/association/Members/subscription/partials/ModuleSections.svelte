<script>
    import QuillEditor from 'components/inputs/QuillEditor.svelte';
    import {PlusCircle, TrashSimple, CaretCircleDown, CaretCircleUp} from 'phosphor-svelte';
    import {scale, slide, fade, fly} from 'svelte/transition';
    import {onMount} from 'svelte';

    export let userData;

    onMount(() => {
        if (userData?.sport_association.empty_sections) {
            userData.sport_association.regulation = `
                La quota annuale comprende iscrizione, assicurazione ed affiliazione all'AICS CONI (come previsto dalla legge).<br />
                Con l'iscrizione all'associazione <b><i>${userData?.sport_association.denomination}</i></b>
                si intendono visionare ed accettare tutte le norme qui elencate:<br />
                <ol>
                    <li>
                        La quota di partecipazione mensile è da versare entro la prima settimana del mese preso in
                        considerazione.
                    </li>

                    <li>NON SONO ASSOLUTAMENTE PREVISTI SCONTI PER LEZIONI PERSE, SE NON PER PERIODI MOLTO LUNGHI.</li>

                    <li>
                        E' OBBLIGATORIO CONSEGNARE IL CERTIFICATO MEDICO DI IDONEITA' SPORTIVA AGONISTICA/NON AGONISTICA ENTRO
                        LA PRIMA SETTIMANA DALL'ISCRIZIONE (se cosi non fosse, l'allievo/a non potrà accedere ai corsi).
                    </li>

                    <li>E' richiesto un comportamento idoneo in tutti i locali della scuola.</li>

                    <li>I genitori e gli accompagnatori, durante la lezione devono uscire dalla palestra.</li>

                    <li>L'Associazione non risponde di cose perse, rubate o danneggiate.</li>

                    <li>
                        Gli insegnanti destineranno gli allievi nei corsi che riterranno piu adeguati.
                        <b>Non saranno ammesse richieste di cambio di corso ne di orario</b>.
                    </li>

                    <li>
                        Per qualsiasi informazione lo staff di <b><i>${userData?.sport_association.denomination}</i></b>
                        è a Vostra completa disposizione.
                    </li>
                </ol>
            `;

            userData.sport_association.demand = `
                CHIEDE di essere ammesso quale socio/a all'<b><i>${userData?.sport_association.denomination}</i></b>
                affiliata al CONI, per lo svolgimento e il raggiungimento degli scopi primari della stessa, attenendosi allo statuto
                sociale ed alle deliberazioni degli organi sociali, nonché a pagare la quota sociale. Dichiara di aver preso nota
                dello Statuto e del Regolamento e di accettarli integralmente. Ricevuta l'informativa sull'utilizzazione dei miei
                dati personali ai sensi dell'ex art. 13 del Decreto Legislativo n. 196/2003 consento al loro trattamento nella misura
                necessaria per il perseguimento degli scopi statuari. Consento anche che i dati riguardanti l'iscrizione siano comunicati
                agli enti con cui l'associazione collabora e da questi trattati nella misura necessaria all'adempimento di obblighi
                previsti dalla legge e dalle norme statuarie.
            `;
        }
    });
</script>

<div class="row d-flex justify-content-start flex-column mx-0">
    <h2 class="text-dark font-weight-boldest">Sezioni Modulo</h2>
    <p class="text-dark-75 font-size-sm font-weight-bold">
        Aggiungi, modifica o elimina sezioni del modulo di iscrizione.
    </p>
</div>

<h1 class="mt-12 font-weight-boldest text-left text-primary">Sezioni base</h1>

<div class="row">
    <div class="col-lg-9 col-xl-6 mt-7">
        <h5 class="font-weight-boldest mb-4 font-size-h6">REGOLAMENTO DELL'ASSOCIAZIONE</h5>
    </div>
</div>

<div class="row mx-0">
    <div class="d-flex gap-3 py-2 px-4 border rounded-lg shadow-xs mb-4" style="gap: 1rem;">
        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_regulation_to_members} />
            <span class="mr-3" />
            Visibile ai <b class="font-weight-boldest ml-1">SOCI</b>
        </label>

        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_regulation_to_both} />
            <span class="mr-3" />
            Visibile a <b class="font-weight-boldest mx-1">SOCI</b> e <b class="font-weight-boldest ml-1">TESSERATI</b>
        </label>

        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_regulation_to_athletes} />
            <span class="mr-3" />
            Visibile ai <b class="font-weight-boldest ml-1">TESSERATI</b>
        </label>
    </div>
</div>

<div class="mb-6 fs-1-1">
    <QuillEditor bind:value={userData.sport_association.regulation} />
</div>

<div class="row">
    <div class="col-lg-9 col-xl-6 mt-6">
        <h5 class="font-weight-boldest mb-4 font-size-h6">RICHIESTA</h5>
    </div>
</div>

<div class="row mx-0">
    <div class="d-flex gap-3 py-2 px-4 border rounded-lg shadow-xs mb-4" style="gap: 1rem;">
        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_demand_to_members} />
            <span class="mr-3" />
            Visibile ai <b class="font-weight-boldest ml-1">SOCI</b>
        </label>

        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_demand_to_both} />
            <span class="mr-3" />
            Visibile a <b class="font-weight-boldest mx-1">SOCI</b> e <b class="font-weight-boldest ml-1">TESSERATI</b>
        </label>

        <label class="checkbox checkbox-sm font-weight-bold">
            <input type="checkbox" bind:checked={userData.sport_association.show_demand_to_athletes} />
            <span class="mr-3" />
            Visibile ai <b class="font-weight-boldest ml-1">TESSERATI</b>
        </label>
    </div>
</div>

<div class="mb-6 fs-1-1">
    <QuillEditor bind:value={userData.sport_association.demand} />
</div>

<h1 class="mt-12 text-primary font-weight-boldest text-left">Sezioni aggiuntive</h1>

{#each userData?.sport_association?.additional_sections || [] as section, idx}
    <div
        out:fade={{duration: 250}}
        in:fly={{duration: 250, y: 100}}
        class="my-6 {section?.error ? 'p-4 border border-2 border-danger rounded-lg' : ''}">
        <div class="d-flex py-2 justify-content-start align-items-center">
            <h6 class="text-dark font-weight-boldest mb-0" style="width: 8rem;">Sezione n. {idx + 1}</h6>
            <div class="d-flex align-items-center">
                <button
                    class="btn btn-light-danger btn-icon btn-sm ml-4 font-weight-boldest mb-0"
                    on:click={() => {
                        // ask for confirmation with sweetalert
                        if (!confirm('Sei sicuro di voler eliminare questa sezione? Questa azione è irreversibile.'))
                            return;
                        userData.sport_association.additional_sections =
                            userData?.sport_association.additional_sections.filter((item, index) => index !== idx);
                    }}>
                    <TrashSimple size={18} weight="bold" />
                </button>
                <button
                    class="btn btn-light btn-icon btn-sm ml-2 font-weight-boldest mb-0"
                    on:click={() => {
                        section.collapsed = !section.collapsed;
                    }}>
                    {#if section.collapsed}
                        <CaretCircleDown size={18} weight="bold" />
                    {:else}
                        <CaretCircleUp size={18} weight="bold" />
                    {/if}
                </button>
            </div>
        </div>

        <div class="row mx-0">
            <div class="d-flex align-items-center my-4 border rounded-xl py-2 px-4 shadow-xs">
                <label class="checkbox checkbox-sm font-weight-bold">
                    <input
                        type="checkbox"
                        bind:checked={section.show_to_members}
                        on:input={() => userData.set(userData)} />
                    <span class="mr-3" />
                    Visibile ai <b class="font-weight-boldest ml-1">SOCI</b>
                </label>

                <label class="checkbox checkbox-sm font-weight-bold ml-6">
                    <input
                        type="checkbox"
                        bind:checked={section.show_to_both}
                        on:input={() => userData.set(userData)} />
                    <span class="mr-3" />
                    Visibile a <b class="font-weight-boldest ml-1">SOCI E TESSERATI</b>
                </label>

                <label class="checkbox checkbox-sm font-weight-bold ml-6">
                    <input
                        type="checkbox"
                        bind:checked={section.show_to_athletes}
                        on:input={() => userData.set(userData)} />
                    <span class="mr-3" />
                    Visibile ai <b class="font-weight-boldest ml-1">TESSERATI</b>
                </label>
            </div>
        </div>

        <div class="row d-{section.collapsed ? 'none' : 'block'} m-0 p-0">
            <div class="row">
                <div class="col-12 mb-2 mt-2">
                    <label for="input" class="font-weight-boldest">Titolo</label>
                    <div class="input-group input-group-solid">
                        <input
                            type="text"
                            class="form-control"
                            bind:value={section.name}
                            on:input={() => userData.set(userData)}
                            placeholder="Nome sezione..." />
                    </div>
                </div>
            </div>
            <label for="input" class="font-weight-boldest mt-2">Testo</label>
            <QuillEditor bind:value={section.text} />
        </div>
        {#if section?.error}
            <div class="alert bg-light-danger rounded-lg text-danger mt-4" role="alert">
                {section?.error}
            </div>
        {/if}
    </div>
{/each}

<div class="col-12 mt-7 d-flex justify-content-center border rounded-lg py-12 flex-column">
    <h2 class="text-dark font-weight-boldest mx-auto">Aggiungi nuova sezione</h2>
    <button
        class="btn btn-primary btn-sm font-weight-boldest d-flex align-items-center mx-auto mt-4"
        on:click={() => {
            if (!userData?.sport_association.additional_sections) userData.sport_association.additional_sections = [];
            userData.sport_association.additional_sections = [
                ...userData?.sport_association.additional_sections,
                {
                    name: '',
                    text: '',
                    collapsed: false,
                },
            ];
        }}>
        <PlusCircle size={16} weight="bold" class="mr-1" />
        Aggiungi</button>
</div>

<!-- <pre>
    {JSON.stringify(userData, null, 2)}
</pre> -->
