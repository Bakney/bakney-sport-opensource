<script>
    import {onMount} from 'svelte';

    // generate random id
    export let id = Math.random().toString(36).substring(7);
    export let value = '';
    export let placeholder = 'Scrivi qui il testo...';

    let quill;

    onMount(() => {
        initQuill();
    });

    function initQuill() {
        quill = new Quill(`#quill-editor-${id}`, {
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'link'],
                    [{list: 'ordered'}, {list: 'bullet'}, 'image'],
                    [{align: []}],
                ],
            },
            placeholder: placeholder,
            theme: 'snow', // or 'bubble'
        });
        // quill.pasteHTML(value);

        const delta = quill.clipboard.convert(value);
        quill.setContents(delta);

        quill.on('text-change', () => {
            value = quill.root.innerHTML;
        });
    }
</script>

<div role="textbox" tabindex="0">
    <div id="quill-editor-{id}" />
</div>

<svelte:head>
    <style>
        .ql-toolbar.ql-snow {
            background: #f4f6f9 !important;
        }
        .ql-editor {
            background: #f4f6f900 !important;
        }
        .ql-snow .ql-tooltip[data-mode='link']::before {
            content: 'Inserisci link:';
        }

        .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
            border-right: 0px;
            content: 'Salva';
            padding-right: 0px;
        }
        .ql-align.ql-picker.ql-icon-picker {
            position: relative !important;
            top: -0.5rem !important;
        }
    </style>
</svelte:head>
