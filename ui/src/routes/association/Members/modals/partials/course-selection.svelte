<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {onMount} from 'svelte';
    import {SmartMultiSelect} from 'components/formBuilder/preview-blocks/index.js';
    import {toast} from 'svelte-sonner';

    export let formData;
    export let getSubscriptionInfo = true;

    let currentInfo;
    let availableCourses = [];
    let fetchInfoLoading = true;

    async function fetchInfo(page, reset = false) {
        // console.info(formData);
        const res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.INFO, formData.subscription_id), {
            method: 'GET',
        });
        if (!res.error) {
            currentInfo = res.response.data;
            formData.renewal_info = {
                courses:
                    currentInfo?.courses?.map(x => {
                        return {
                            value: x.course_id,
                            label: x.title,
                        };
                    }) || [],
                carnet: [],
            };
            console.info(formData.renewal_info);
        } else {
            // fire toast error
            toast.error('Errore nel caricamento dei dati');
        }
    }

    async function fetchAvailableCourses() {
        let res = await apiFetch(`${__bakney.env.API.COURSE.LIST}?all=1`);
        if (!res.error) {
            availableCourses = [
                ...Object.keys(res.response.data)?.map(key => {
                    return {
                        value: res.response.data[key].course_id,
                        label: res.response.data[key].title,
                    };
                }),
            ];
        }
    }

    onMount(async () => {
        if (!formData.renewal_info) {
            formData.renewal_info = {
                courses: [],
                carnets: [],
            };
        }
        fetchInfoLoading = true;
        // formData.renewal_info = {
        //     courses: [],
        //     carnet: [],
        // };
        if (getSubscriptionInfo == true && formData.subscription_id) {
            await fetchInfo();
        }
        await fetchAvailableCourses();
        fetchInfoLoading = false;
    });
</script>

<div class="mb-8 mt-2">
    <div>
        <div
            class="label label-light-primary label-inline px-3 font-weight-bold font-weight-bolder"
            style="width: fit-content;font-size:1.1rem;">
            {formData.associate.first_name}
            {formData.associate.last_name}
        </div>
        <div
            class="label label-light-primary label-inline px-3 font-weight-bold font-weight-bolder"
            style="width: fit-content;font-size:1.1rem;">
            {formData.age ?? formData.associate.age} anni
        </div>
    </div>
    <div class="mb-8 mt-6">
        <div>
            {#await fetchInfoLoading then data}
                {#if formData?.renewal_info?.courses}
                    <SmartMultiSelect
                        customClasses={'min-w-100 mb-0'}
                        editable={false}
                        active={false}
                        minNumberOfSelectedItems={0}
                        bind:value={formData.renewal_info.courses}
                        props={{
                            id: 'formData.courses',
                            name: 'formData.courses',
                            label: 'Corsi',
                            placeholder: 'Seleziona uno o più corsi',
                            required: false,
                            clearable: false,
                            searchable: true,
                            showChevron: true,
                            multiple: true,
                            helperLabel: "Seleziona i corsi ai quali iscrivere l'atleta",
                            options: availableCourses || [],
                            value: formData?.renewal_info?.courses || [],
                        }} />
                {/if}
            {/await}
        </div>
    </div>
</div>
