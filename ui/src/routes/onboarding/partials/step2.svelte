<script>
    import {PhoneInput, SmartSelect} from 'components/formBuilder/preview-blocks';
    import TextInput from 'components/formBuilder/preview-blocks/text-input.svelte';
    import {userData} from 'store/stores';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {getDataFromForm} from 'utils/Functions';
    import confetti from 'canvas-confetti';
    import {toast} from 'svelte-sonner';
    import {canPerformAction} from 'utils/Permissions';

    userData.useLocalStorage();

    export let isLoading = false;

    const sportAssociationSizes = [
        {label: 'meno di 50 tesserati', value: 'meno di 50 tesserati'},
        {label: '50 - 100 tesserati', value: '50 - 100 tesserati'},
        {label: '100 - 200 tesserati', value: '100 - 200 tesserati'},
        {label: '200 - 500 tesserati', value: '200 - 500 tesserati'},
        {label: 'più di 500 tesserati', value: 'più di 500 tesserati'},
    ];

    function completeWelcomeStep(res) {
        if (!res.error) {
            setTimeout(() => {
                confetti({
                    particleCount: 200,
                    spread: 400,
                    origin: {
                        y: 0.5,
                    },
                });
                localStorage.removeItem('userData');
                toast.success('Configurazione del tuo gestionale completata');
                setTimeout(() => {
                    history.pushState(null, '', `/`);
                    canPerformAction('association.dashboard.read');
                    window.location.reload();
                    isLoading = false;
                }, 1000);
            }, 500);
        } else {
            isLoading = false;
            toast.error('Errore nella configurazione del tuo gestionale');
        }
    }

    async function handleSubmit(e) {
        isLoading = true;
        // get the form data
        let data = getDataFromForm(e);
        let res = await apiFetch(__bakney.env.API.ONBOARDING.UPDATE, {
            method: 'PATCH',
            body: JSON.stringify({
                lead_data: {
                    lead_sport_association_role: data.lead_sport_association_role,
                    lead_sport_market_channel: data.lead_sport_market_channel,
                    lead_sport_association_size: JSON.parse(data.lead_sport_association_size)?.value,
                    phone: data.phone,
                },
            }),
        });
        completeWelcomeStep(res);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="row">
        <TextInput
            customClasses={'px-0 mx-0 my-6 px-md-4 col-12'}
            editable={false}
            active={false}
            props={{
                id: 'lead_sport_association_role',
                name: 'lead_sport_association_role',
                label: 'Che ruolo ricopri?',
                placeholder: 'Inserisci il tuo ruolo',
                required: true,
                value: $userData?.lead_sport_association_role || '',
            }} />
    </div>
    <div class="row">
        <SmartSelect
            customClasses={'px-0 mx-0 my-6 px-md-4 col-12'}
            editable={false}
            active={false}
            props={{
                id: 'lead_sport_market_channel',
                name: 'lead_sport_market_channel',
                label: 'Da dove hai conosciuto Bakney?',
                placeholder: 'Seleziona da dove hai conosciuto Bakney',
                required: true,
                clearable: false,
                searchable: false,
                showChevron: true,
                options: [
                    {label: 'Facebook', value: 'facebook'},
                    {label: 'Instagram', value: 'instagram'},
                    {label: 'Linkedin', value: 'linkedin'},
                    {label: 'TikTok', value: 'tiktok'},
                    {label: 'YouTube', value: 'youtube'},
                    {label: 'Cercando su Google', value: 'google'},
                    {label: 'Consigliato da un amico', value: 'friends'},
                    {label: 'Fiera o evento', value: 'event'},
                    {label: 'Email o newsletter', value: 'email'},
                    {label: 'Pubblicità online', value: 'ads'},
                    {label: 'Altro', value: 'altro'},
                ],
                value: $userData?.lead_sport_market_channel || '',
            }} />
    </div>
    <div class="row">
        <SmartSelect
            customClasses={'px-0 mx-0 my-6 px-md-4 col-12'}
            editable={false}
            active={false}
            props={{
                id: 'lead_sport_association_size',
                name: 'lead_sport_association_size',
                label: 'Quanti tesserati ha la tua associazione?',
                placeholder: 'Seleziona quanti tesserati ha la tua associazione',
                required: true,
                clearable: false,
                searchable: false,
                showChevron: true,
                options: sportAssociationSizes,
                value: $userData?.lead_sport_association_size || sportAssociationSizes[0].value,
            }} />
    </div>
    <div class="row">
        <PhoneInput
            customClasses={'px-0 mx-0 my-6 px-md-4 col-12'}
            editable={false}
            active={false}
            props={{
                id: 'phone',
                name: 'phone',
                label: 'Numero di telefono',
                placeholder: '3401112435...',
                helperLabel: '<b>Non è obbligatorio</b>, ma utile per contattarti in caso di necessità',
                required: false,
                value: $userData?.phone || '',
            }} />
    </div>

    <slot />
</form>
