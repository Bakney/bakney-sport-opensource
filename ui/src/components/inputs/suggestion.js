import tippy from 'tippy.js';
import MentionList from './MentionList.svelte';

export default {
    items: ({ query }) => {
        return [
            // sport association
            {label: "Denominazione", value: 'sport_association.denomination', group: "Organizzazione"},
            {label: "Codice Fiscale", value: 'sport_association.tax_code', group: "Organizzazione"}, 
            {label: "IBAN", value: 'sport_association.iban', group: "Organizzazione"},
            {label: "Sito Web", value: 'sport_association.website', group: "Organizzazione"},
            {label: "Nome Abbreviato", value: 'sport_association.abbreviated', group: "Organizzazione"},
            {label: "Partita IVA", value: 'sport_association.vat_number', group: "Organizzazione"},
            {label: "WhatsApp", value: 'sport_association.whatsapp', group: "Organizzazione"},
            {label: "Partita IVA", value: 'sport_association.vat_number', group: "Organizzazione"},
            {label: "Indirizzo", value: 'sport_association.address', group: "Organizzazione"},
            {label: "Comune", value: 'sport_association.address_city', group: "Organizzazione"},
            {label: "CAP", value: 'sport_association.address_cap', group: "Organizzazione"},
            {label: "Logo", value: 'sport_association.logo', group: "Organizzazione"},
            {label: 'Email', value: 'sport_association.user.email', group: "Organizzazione"},
            {label: 'Telefono', value: 'sport_association.whatsapp', group: "Organizzazione"},
            {label: 'Federazione', value: 'sport_association.federation', group: "Organizzazione"},
            {label: 'Sport', value: 'sport_association.sport', group: "Organizzazione"},
            // associate
            {label: "Nome", value: 'associate.first_name', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Cognome", value: 'associate.last_name', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Codice Fiscale", value: 'associate.tax_code', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Data di Nascita", value: 'associate.born_date', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Città di Nascita", value: 'associate.born_city', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Indirizzo", value: 'associate.address', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Città", value: 'associate.address_city', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "CAP", value: 'associate.address_cap', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Nazionalità", value: 'associate.nationality', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Paese di Residenza", value: 'associate.nationality_residence', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Email", value: 'associate.email', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono", value: 'associate.phone', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 2", value: 'associate.phone_2', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 3", value: 'associate.phone_3', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 4", value: 'associate.phone_4', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono", value: 'associate.phone_label', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 2", value: 'associate.phone_2_label', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 3", value: 'associate.phone_3_label', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 4", value: 'associate.phone_4_label', group: "Associato", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Note", value: 'associate.notes', group: "Associato"},
            // tutor
            {label: "Nome", value: 'main_tutor.first_name', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Cognome", value: 'main_tutor.last_name', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Codice Fiscale", value: 'main_tutor.tax_code', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Data di Nascita", value: 'main_tutor.born_date', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Città di Nascita", value: 'main_tutor.born_city', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Indirizzo", value: 'main_tutor.address', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Città", value: 'main_tutor.address_city', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "CAP", value: 'main_tutor.address_cap', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Nazionalità", value: 'main_tutor.nationality', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Paese di Residenza", value: 'main_tutor.nationality_residence', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Email", value: 'main_tutor.email', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono", value: 'main_tutor.phone', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 2", value: 'main_tutor.phone_2', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 3", value: 'main_tutor.phone_3', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Telefono 4", value: 'main_tutor.phone_4', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono", value: 'main_tutor.phone_label', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 2", value: 'main_tutor.phone_2_label', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 3", value: 'main_tutor.phone_3_label', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Etichetta Telefono 4", value: 'main_tutor.phone_4_label', group: "Tutore Principale", ignoreInFooter: true, ignoreInHeader: true},
            {label: "Note", value: 'main_tutor.notes', group: "Tutore Principale"},
            // Receipt
            {label: "Numero Ricevuta", value: 'invoice.number', group: "Ricevuta"},
            {label: "Data Ricevuta", value: 'invoice.creation_date', group: "Ricevuta"},
            {label: "Importo Attività Ricevuta", value: 'invoice.activity_fee', group: "Ricevuta"},
            {label: "Importo Iscrizione Ricevuta", value: 'invoice.membership_fee', group: "Ricevuta"},
            {label: "Importo Totale Ricevuta", value: 'invoice.total_amount', group: "Ricevuta"},
            // Other
            {label: "Data Odierna", value: 'other.today', group: "Altro"},
            {label: "Lista corsi", value: 'other.courses_list', group: "Altro", ignoreInFooter: true, ignoreInHeader: true},
        ]
            .filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    },

    render: (ignoreInFooter=false, ignoreInHeader=false) => {
        let component;
        let popup;


        return {
            onStart: props => {
                // Create new component instance
                const target = document.createElement('div');
                component = new MentionList({
                    target,
                    props: {
                        items: props.items.filter(x => {
                            if (ignoreInFooter && x.ignoreInFooter) {
                                return false;
                            }
                            if (ignoreInHeader && x.ignoreInHeader) {
                                return false;
                            }
                            return true;
                        }),
                        command: props.command
                    }
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: target,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props) {
                component.$set({
                    items: props.items.filter(x => {
                        if (ignoreInFooter && x.ignoreInFooter) {
                            return false;
                        }
                        if (ignoreInHeader && x.ignoreInHeader) {
                            return false;
                        }
                        return true;
                    }),
                    command: props.command
                });

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }

                return component.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.$destroy();
            },
        };
    },
};
