<script>
    import {ImageUpload} from 'components/formBuilder/preview-blocks';
    import TextInput from 'components/formBuilder/preview-blocks/text-input.svelte';
    import {userData} from 'store/stores';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {getDataFromForm} from 'utils/Functions';

    userData.useLocalStorage();

    export let currentStep;
    let logo;

    async function handleSubmit(e) {
        // get the form data
        let data = getDataFromForm(e);
        let res = await apiFetch(__bakney.env.API.ONBOARDING.UPDATE, {
            method: 'PATCH',
            body: JSON.stringify({
                sport_association: {
                    logo: logo,
                    denomination: data.denomination,
                    tax_code: data.tax_code,
                    sport: data.sport,
                },
            }),
        });

        if (!res.error) {
            currentStep += 1;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <ImageUpload
        customClasses={'px-0 mx-0 my-6'}
        editable={false}
        active={false}
        bind:value={logo}
        props={{
            id: 'logo',
            name: 'logo',
            label: 'Logo o Timbro con firma del presidente',
            placeholder: 'Inserisci il logo',
            required: true,
            placeholderImage: '/static/placeholder_logo.png',
            value: $userData?.sport_association?.logo || '',
            helperLabel: 'La dimensione consigliata è 590 x 130px.',
        }} />

    <div class="row">
        <TextInput
            customClasses={'px-0 mx-0 my-6 px-md-4 col-12 col-md-6'}
            editable={false}
            active={false}
            props={{
                id: 'denomination',
                name: 'denomination',
                label: 'Nome associazione / società',
                placeholder: 'Inserisci il nome',
                required: true,
                value: $userData?.sport_association?.denomination || '',
            }} />

        <TextInput
            customClasses={'px-0 mx-0 my-6 px-md-4  col-12 col-md-6'}
            editable={false}
            active={false}
            props={{
                id: 'tax_code',
                name: 'tax_code',
                label: 'P.IVA / Codice fiscale',
                placeholder: 'Inserisci il codice fiscale o P.IVA',
                required: true,
                value: $userData?.sport_association?.tax_code || '',
            }} />
    </div>

    <TextInput
        customClasses={'px-0 mx-0 my-6'}
        editable={false}
        active={false}
        props={{
            id: 'sport',
            name: 'sport',
            label: 'Sport',
            placeholder: 'Inserisci uno o più sport',
            required: false,
            value: $userData?.sport_association?.sport || '',
        }} />

    <slot />
</form>
