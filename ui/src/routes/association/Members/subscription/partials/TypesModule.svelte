<script>
    import {CheckBoxSelect} from 'components/formBuilder/preview-blocks';

    export let userData;

    function updateVisibleOptions() {
        if (
            userData?.preview_and_custom_features?.find(x => x.name === 'Iscrizioni per Enti e Federazioni') !==
            undefined
        ) {
            return;
        }
        userData.sport_association.enabled_for = [];
        // update enabled_for based on selected options
        let associateCheckbox = document.querySelector('#associate-checkbox');
        let associateMembershipCheckbox = document.querySelector('#associate-membership-checkbox');
        let membershipCheckbox = document.querySelector('#membership-checkbox');

        if (associateCheckbox.checked) {
            userData?.sport_association.enabled_for.push('associate');
        }
        if (associateMembershipCheckbox.checked) {
            userData?.sport_association.enabled_for.push('associate-membership');
        }
        if (membershipCheckbox.checked) {
            userData?.sport_association.enabled_for.push('membership');
        }
    }
</script>

<div class="col-12 col-md-4">
    <CheckBoxSelect
        additionalClasses={'border px-8 py-8'}
        editable={false}
        active={false}
        on:change={() => {
            updateVisibleOptions();
        }}
        props={{
            id: 'enabled_for',
            name: 'enabled_for',
            label: 'Accetta iscrizioni di',
            helperLabel: 'Seleziona quali tipologie di iscrizione rendere attive.',
            required: true,
            options: [
                {
                    id: 'associate-checkbox',
                    label: 'Socio',
                    name: 'associate',
                    value: 'associate',
                    checked: userData?.sport_association?.enabled_for?.includes('associate') ?? true,
                },
                {
                    id: 'associate-membership-checkbox',
                    label: 'Socio e Tesserato',
                    name: 'associate-membership',
                    value: 'associate-membership',
                    checked: userData?.sport_association?.enabled_for?.includes('associate-membership') ?? true,
                },
                {
                    id: 'membership-checkbox',
                    label: 'Tesserato',
                    name: 'membership',
                    value: 'membership',
                    checked: userData?.sport_association?.enabled_for?.includes('membership') ?? true,
                },
            ],
            clearable: false,
            searchable: true,
            showChevron: true,
        }} />
</div>
