<script>
    import { onMount } from 'svelte';
    import Quillz from 'quill';
    import "quill-mention/autoregister";
    import "quill-mention/dist/quill.mention.css";
    import "quill/dist/quill.core.css";
    import "quill/dist/quill.snow.css";



    export let id = Math.random().toString(36).substring(7);
    export let value = '';
    export let placeholder = 'Scrivi qui il testo...';

    let quill;

    onMount(() => {
        initQuill();
    });

    function initQuill() {
        quill = new Quillz(`#quill-editor-${id}`, {
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'link'],
                    [{list: 'ordered'}, {list: 'bullet'}, 'image'],
                    [{align: []}],
                    ['mention', 'checkbox']
                ],
                mention: {
                    mentionDenotationChars: ['@'],
                    source: function(searchTerm, renderList) {
                        const values = [
                            { id: 1, value: '{{associate.full_name}}' },
                            { id: 2, value: 'Associato - Scadenza Certificato Medico' }
                        ];
                        const matches = values.filter(item => 
                            item.value.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        renderList(matches);
                    }
                },
            },
            placeholder: placeholder,
            theme: 'snow'
        });

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
{value}

<svelte:head>

    <style>
        .ql-toolbar.ql-snow {
            background: #f4f6f9 !important;
            border: 1px solid #e2e8f0 !important;
            border-bottom: none !important;
            border-radius: 1rem 1rem 0 0 !important;
        }
        .ql-toolbar.ql-snow > .ql-formats > button {
            margin-bottom: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .ql-editor {
            background: #f4f6f900 !important;
            min-height: 120px;
            font-size: 14px;
        }
        .ql-snow .ql-tooltip[data-mode='link']::before {
            content: 'Inserisci link:';
        }

        .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
            border-right: 0px;
            content: 'Salva';
            padding-right: 0px;
        }

        .ql-container.ql-snow {
            border: 1px solid #e2e8f0 !important;
            border-radius: 0 0 1rem 1rem !important;
        }
        .ql-mention:before {
            content: '@';
            font-size: 16px;
            color: #aaa;
            font-weight: bold;
        }
        .ql-checkbox:before {
            content: '✓';
            font-size: 16px;
            color: #aaa;
            font-weight: bold;
        }
        /* Custom icons */
        /* .ql-calendar::before { content: '📅'; }
        .ql-table::before { content: '▦'; }
        .ql-divider::before { content: '—'; }
        .ql-mention::before { content: '@'; }
        .ql-checkbox::before { content: '☐'; } */
        .ql-align.ql-picker.ql-icon-picker {
            position: relative !important;
            top: -0.25rem !important;
        }

        /* Mention styles */
        .mention {
            background: #e8f0fe;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</svelte:head>