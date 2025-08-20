import {
    Textbox,
    Article,
    TextHOne,
    Paragraph,
    Link,
    ListBullets,
    ListChecks,
    Envelope,
    Paperclip,
    List,
    PenNib,
    Calendar,
} from 'phosphor-svelte';
import TextInput from './preview-blocks/text-input.svelte';
import TextareaInput from './preview-blocks/textarea-input.svelte';
import Heading from './preview-blocks/heading.svelte';
import ParagraphC from './preview-blocks/paragraph.svelte';
import LinkC from './preview-blocks/link.svelte';
import RadioSelect from './preview-blocks/radio-select.svelte';
import CheckboxSelect from './preview-blocks/checkbox-select.svelte';
import EmailInput from './preview-blocks/email-input.svelte';
import FileInput from './preview-blocks/file-input.svelte';
import SmartSelectInput from './preview-blocks/smart-select-input.svelte';
import SignatureInput from './preview-blocks/signature-input.svelte';
import {Datepicker} from './preview-blocks/index';

export const InputTypes = [
    {
        type: 'heading',
        icon: TextHOne,
        props: {
            label: 'Intestazione',
            value: 'Titolo',
            size: 'h1',
            id: 'heading',
        },
        component: Heading,
    },
    {
        type: 'paragraph',
        icon: Paragraph,
        props: {
            label: 'Paragrafo',
            value: 'Questo è un paragrafo.',
            id: 'paragraph',
        },
        component: ParagraphC,
    },
    {
        type: 'text',
        icon: Textbox,
        props: {
            label: 'Testo',
            helperLabel: null,
            placeholder: 'inserisci testo...',
            required: true,
            name: 'text',
            id: 'text',
        },
        component: TextInput,
    },
    {
        type: 'email',
        icon: Envelope,
        props: {
            label: 'Email',
            helperLabel: null,
            placeholder: "inserisci l'email...",
            required: true,
            name: 'email',
            id: 'email',
        },
        component: EmailInput,
    },
    // {
    //     type: 'file',
    //     icon: Paperclip,
    //     props: {
    //         label: 'File',
    //         helperLabel: null,
    //         placeholder: 'allega file',
    //         required: true,
    //         name: 'file',
    //         id: 'file',
    //     },
    //     component: FileInput,
    // },
    {
        type: 'listRadio',
        icon: ListBullets,
        props: {
            label: 'Risposta singola',
            helperLabel: null,
            placeholder: 'inserisci testo...',
            options: [],
            required: true,
            name: 'text',
            id: 'text',
        },
        component: RadioSelect,
    },
    {
        type: 'listCheckbox',
        icon: ListChecks,
        props: {
            label: 'Risposta multipla',
            helperLabel: null,
            placeholder: 'inserisci testo...',
            options: [],
            required: true,
            name: 'text',
            id: 'text',
        },
        component: CheckboxSelect,
    },
    {
        type: 'textArea',
        icon: Article,
        props: {
            label: 'Descrizione',
            helperLabel: null,
            placeholder: 'inserisci testo...',
            required: true,
            name: 'textArea',
            id: 'textArea',
        },
        component: TextareaInput,
    },
    {
        type: 'link',
        icon: Link,
        props: {
            label: 'Link',
            value: 'questo è un link',
            href: 'https://www.bakney.com',
            id: 'link',
        },
        component: LinkC,
    },
    {
        type: 'signature',
        icon: PenNib,
        props: {
            label: 'Firma',
            helperLabel: null,
            placeholder: 'inserisci la firma...',
            required: true,
            name: 'signature',
            id: 'signature',
        },
        component: SignatureInput,
    },
    {
        type: 'datepicker',
        icon: Calendar,
        props: {
            label: 'Data',
            helperLabel: null,
            placeholder: 'Data...',
            required: true,
            name: 'datepicker',
            id: 'datepicker',
            format: 'DD/MM/YYYY',
        },
        component: Datepicker,
    },
    /*  {
        type: 'smartSelect',
        icon: List,
        props: {
            label: 'Menu a tendina',
            helperLabel: null,
            placeholder: 'Seleziona...',
            options: [],
            required: true,
            name: 'text',
            id: 'text',
        },
        component: SmartSelectInput,
    }, */
];
