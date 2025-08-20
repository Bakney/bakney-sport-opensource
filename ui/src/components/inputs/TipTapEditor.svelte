<script>
    import {onMount, onDestroy, afterUpdate} from 'svelte';
    import {Editor, Node} from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import Placeholder from '@tiptap/extension-placeholder';
    import TaskList from '@tiptap/extension-task-list';
    import TaskItem from '@tiptap/extension-task-item';
    import TipTapImage from '@tiptap/extension-image';
    import {getOnTransaction, getHandlePaste} from './editorCustom.js';

    import {
        ArrowUUpLeft,
        ArrowUUpRight,
        At,
        CheckSquare,
        Image,
        LinkSimple,
        ListBullets,
        ListNumbers,
        ListPlus,
        MinusCircle,
        PlusCircle,
        Table,
        TextAlignCenter,
        TextAlignJustify,
        TextAlignLeft,
        TextAlignRight,
        TextB,
        TextH,
        TextHOne,
        TextHThree,
        TextHTwo,
        TextItalic,
        TextT,
        TextUnderline,
        TrashSimple,
        Paragraph as ParagraphIcon,
        ArrowsOutCardinal,
        ArrowLineDown,
        UniteSquare,
    } from 'phosphor-svelte';
    import Paragraph from '@tiptap/extension-paragraph';
    import Dropcursor from '@tiptap/extension-dropcursor';
    import TextAlign from '@tiptap/extension-text-align';
    import Underline from '@tiptap/extension-underline';
    import TableTipTap from '@tiptap/extension-table';
    import TableCell from '@tiptap/extension-table-cell';
    import TableHeader from '@tiptap/extension-table-header';
    import TableRow from '@tiptap/extension-table-row';
    import Link from '@tiptap/extension-link';
    import Mention from '@tiptap/extension-mention';
    import suggestion from './suggestion.js';

    export let value = '';
    export let placeholder = 'Inserisci il testo...';
    export let mentions = true;
    export let isFooter = false;
    export let isHeader = false;

    let element;
    let editor;
    let isTableMenuVisible = false;

    let currentTableCell = null;

    const updateTableMenuVisibility = () => {
        if (editor) {
            isTableMenuVisible = editor.isActive('table');
        }
    };

    export const PageBreak = Node.create({
        name: 'pageBreak',

        group: 'inline',

        inline: true,

        parseHTML() {
            return [
                {
                    tag: 'div.page-break-before',
                },
            ];
        },

        renderHTML() {
            return ['div', {class: 'page-break-before'}];
        },
    });

    afterUpdate(() => {
        if (editor) {
            value = editor.getHTML();
        }
    });

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [
                StarterKit,
                PageBreak,
                Underline,
                TaskList,
                TaskItem,
                Paragraph.extend({
                    addAttributes() {
                        return {
                            class: {
                                default: null,
                                parseHTML: element => element.getAttribute('class'),
                                renderHTML: attributes => {
                                    if (!attributes.class) return {};
                                    return {class: attributes.class};
                                },
                            },
                        };
                    },
                    addCommands() {
                        return {
                            setParagraphNoPadding:
                                () =>
                                ({commands}) => {
                                    return commands.updateAttributes('paragraph', {
                                        class: 'no-padding',
                                    });
                                },
                        };
                    },
                }),
                TipTapImage.configure({
                    inline: true,
                    allowBase64: true,
                }),
                Dropcursor,
                TableTipTap.configure({
                    resizable: true,
                    HTMLAttributes: {
                        class: 'table',
                    },
                }),
                TableRow,
                TableHeader,
                TableCell.extend({
                    getAttributes() {
                        return {
                            ...this.parent?.(),
                        };
                    },
                    addAttributes() {
                        return {
                            ...this.parent?.(),
                            class: {
                                default: null,
                                parseHTML: element => element.getAttribute('class'),
                                renderHTML: attributes => {
                                    if (attributes.class) {
                                        return {class: attributes.class};
                                    }
                                },
                            },
                            borderTop: {
                                default: null,
                                parseHTML: element => element.getAttribute('bordertop'),
                                renderHTML: attributes => {
                                    if (attributes.borderTop) {
                                        return {borderTop: attributes.borderTop};
                                    }
                                },
                            },
                            borderBottom: {
                                default: null,
                                parseHTML: element => element.getAttribute('borderbottom'),
                                renderHTML: attributes => {
                                    if (attributes.borderBottom) {
                                        return {borderBottom: attributes.borderBottom};
                                    }
                                },
                            },
                            borderLeft: {
                                default: null,
                                parseHTML: element => element.getAttribute('borderleft'),
                                renderHTML: attributes => {
                                    if (attributes.borderLeft) {
                                        return {borderLeft: attributes.borderLeft};
                                    }
                                },
                            },
                            borderRight: {
                                default: null,
                                parseHTML: element => element.getAttribute('borderright'),
                                renderHTML: attributes => {
                                    if (attributes.borderRight) {
                                        return {borderRight: attributes.borderRight};
                                    }
                                },
                            },
                        };
                    },
                }),
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
                Placeholder.configure({
                    placeholder: placeholder || 'Inserisci il testo...',
                }),
                Link.configure({
                    protocols: ['ftp', 'mailto'],
                }),

                mentions &&
                    Mention.configure({
                        HTMLAttributes: {
                            class: 'mention',
                        },
                        suggestion: {
                            items: suggestion.items,
                            render: () => {
                                return suggestion.render(isFooter, isHeader);
                            },
                        },
                        renderHTML({options, node}) {
                            if (typeof node.attrs.id === 'string') {
                                node.attrs.id = JSON.parse(node.attrs.id);
                            }

                            return [
                                'span',
                                {
                                    'data-type': 'mention',
                                    class: 'mention',
                                    key: node.attrs.id?.value,
                                    'data-id': JSON.stringify(node.attrs.id),
                                },
                                `@${node.attrs?.id?.label} - ${node.attrs?.id?.group}`,
                            ];
                        },
                    }),
            ],
            content: value || '',
            onUpdate: ({editor}) => {
                value = editor.getHTML();
                updateTableMenuVisibility();
            },
            onSelectionUpdate: ({editor}) => {
                updateTableMenuVisibility();
            },
        });

        updateTableMenuVisibility();

        editor.setOptions({
            onTransaction: (...args) => {
                updateTableMenuVisibility();
                return getOnTransaction(editor)(...args);
            },
            editorProps: {
                handlePaste: getHandlePaste(editor),
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

<div class="my-4">
    {#if editor}
        <div class="editor-toolbar bg-light px-3">
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().undo().run()}>
                <ArrowUUpLeft size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().redo().run()}>
                <ArrowUUpRight size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleBold().run()}
                class:text-primary={editor.isActive('bold')}>
                <TextB size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleItalic().run()}
                class:text-primary={editor.isActive('italic')}>
                <TextItalic size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleUnderline().run()}
                class:text-primary={editor.isActive('underline')}>
                <TextUnderline size={18} weight="bold" />
            </button>
            <div class="dropdown dropdown-inline">
                <button
                    type="button"
                    class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                    <TextH size={18} weight="bold" />
                </button>
                <div class="dropdown-menu dropdown-menu-sm py-0">
                    <button
                        class="dropdown-item d-flex align-items-center font-weight-bold"
                        on:click={() => {
                            editor.chain().focus().setHeading({level: 1}).run();
                        }}
                        class:active={editor.isActive('heading', {level: 1})}>
                        <TextHOne size={18} weight="bold" class="mr-2" /> Intestazione 1
                    </button>
                    <button
                        class="dropdown-item d-flex align-items-center font-weight-bold"
                        on:click={() => {
                            editor.chain().focus().setHeading({level: 2}).run();
                        }}
                        class:active={editor.isActive('heading', {level: 2})}>
                        <TextHTwo size={18} weight="bold" class="mr-2" /> Intestazione 2
                    </button>
                    <button
                        class="dropdown-item d-flex align-items-center font-weight-bold"
                        on:click={() => {
                            editor.chain().focus().setHeading({level: 3}).run();
                        }}
                        class:active={editor.isActive('heading', {level: 3})}>
                        <TextHThree size={18} weight="bold" class="mr-2" /> Intestazione 3
                    </button>
                    <button
                        class="dropdown-item d-flex align-items-center font-weight-bold"
                        on:click={() => {
                            editor.chain().focus().setParagraph().run();
                        }}
                        class:active={editor.isActive('paragraph')}>
                        <ParagraphIcon size={18} weight="bold" class="mr-2" /> Paragrafo
                    </button>
                    <button
                        class="dropdown-item d-flex align-items-center font-weight-bold"
                        class:active={editor.isActive('paragraph') &&
                            editor.getAttributes('paragraph').class === 'no-padding'}
                        on:click={() => {
                            editor.chain().focus().setParagraphNoPadding().run();
                        }}>
                        <ParagraphIcon size={18} weight="bold" class="mr-2" /> Paragrafo senza margini
                    </button>
                </div>
            </div>
            <!-- svelte-ignore missing-declaration -->
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => {
                    const selection = editor.state.selection;
                    const text = editor.state.doc.textBetween(selection.from, selection.to);
                    swal.fire({
                        title: 'Inserisci URL',
                        input: 'url',
                        inputValue: text,
                        showCancelButton: true,
                        confirmButtonText: 'Conferma',
                        cancelButtonText: 'Annulla',
                        customClass: {
                            confirmButton: 'btn font-weight-bold btn-primary rounded-lg',
                            cancelButton: 'btn font-weight-bold btn-light text-dark rounded-lg',
                        },
                        reverseButtons: true,
                        inputValidator: value => {
                            if (!value) {
                                return 'Devi inserire un URL';
                            }
                            try {
                                new URL(value);
                            } catch {
                                return 'Devi inserire un URL valido';
                            }
                        },
                    }).then(result => {
                        if (result.isConfirmed) {
                            editor.chain().focus().setLink({href: result.value}).run();
                        }
                    });
                }}
                class:text-primary={editor.isActive('link')}>
                <LinkSimple size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleBulletList().run()}
                class:text-primary={editor.isActive('bulletList')}>
                <ListBullets size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleOrderedList().run()}
                class:text-primary={editor.isActive('orderedList')}>
                <ListNumbers size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().toggleTaskList().run()}
                class:text-primary={editor.isActive('taskList')}>
                <CheckSquare size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async e => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = e => {
                            const base64 = e.target.result;
                            editor.chain().focus().setParagraph().run();
                            editor.chain().focus().setImage({src: base64, width: 200}).run();
                            editor.chain().focus().setParagraph().run();
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                }}
                class:text-primary={editor.isActive('image')}>
                <Image size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => {
                    editor.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run();
                    editor.commands.toggleTable();
                }}
                class:text-primary={editor.isActive('table')}>
                <Table size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().setTextAlign('left').run()}
                class:text-primary={editor.isActive({textAlign: 'left'})}>
                <TextAlignLeft size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().setTextAlign('center').run()}
                class:text-primary={editor.isActive({textAlign: 'center'})}>
                <TextAlignCenter size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().setTextAlign('right').run()}
                class:text-primary={editor.isActive({textAlign: 'right'})}>
                <TextAlignRight size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => editor.chain().focus().setTextAlign('justify').run()}
                class:text-primary={editor.isActive({textAlign: 'justify'})}>
                <TextAlignJustify size={18} weight="bold" />
            </button>
            <button
                class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                on:click={() => {
                    editor.commands.insertContent({
                        type: 'pageBreak',
                    });
                }}>
                <ArrowLineDown size={18} weight="bold" />
            </button>
            {#if mentions}
                <button
                    class="btn btn-clean btn-xl font-weight-boldest btn-light p-1 my-2 mb-0"
                    on:click={() => {
                        const {view} = editor;
                        const {state} = view;
                        const {selection} = state;
                        const {empty} = selection;

                        if (empty) {
                            editor.commands.insertContent('@');
                        }
                    }}
                    class:text-primary={editor.isActive('mention')}>
                    <At size={18} weight="bold" />
                </button>
            {/if}
        </div>
    {/if}
    {#if editor}
        <div
            class="bubble-menu px-2 py-2"
            data-tiptap-bubble-menu
            style="display: {isTableMenuVisible ? 'flex' : 'none'}; gap: 0.5rem;">
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0"
                on:click={() => {
                    editor.chain().focus().deleteTable().run();
                    isTableMenuVisible = false;
                }}>
                <TrashSimple size={14} weight="bold" class="text-danger" />
            </button>
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                on:click={() => editor.chain().focus().addRowAfter().run()}>
                <PlusCircle size={14} weight="bold" class="mr-1" /> Riga
            </button>
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                on:click={() => editor.chain().focus().addColumnAfter().run()}>
                <PlusCircle size={14} weight="bold" class="mr-1" /> Colonna
            </button>
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                on:click={() => editor.chain().focus().deleteRow().run()}>
                <MinusCircle size={14} weight="bold" class="mr-1" /> Riga
            </button>
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                on:click={() => editor.chain().focus().deleteColumn().run()}>
                <MinusCircle size={14} weight="bold" class="mr-1" /> Colonna
            </button>
            <button
                class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                on:click={() => editor.chain().focus().mergeCells().run()}>
                <UniteSquare size={14} weight="bold" class="mr-1" /> Unisci celle
            </button>
            <div class="border-controls d-flex gap-2">
                <button
                    class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                    on:click={() => {
                        // get the table
                        const table = editor.chain().focus();
                        // run go to NextCell for upate
                        editor
                            .chain()
                            .focus()
                            .setCellAttribute('borderTop', 'solid')
                            .setCellAttribute('borderBottom', 'solid')
                            .setCellAttribute('borderLeft', 'solid')
                            .setCellAttribute('borderRight', 'solid')
                            .run();
                        while (editor.chain().focus().goToNextCell().run()) {
                            editor
                                .chain()
                                .focus()
                                .setCellAttribute('borderTop', 'solid')
                                .setCellAttribute('borderBottom', 'solid')
                                .setCellAttribute('borderLeft', 'solid')
                                .setCellAttribute('borderRight', 'solid')
                                .run();
                        }
                        while (editor.chain().focus().goToPreviousCell().run()) {
                            editor
                                .chain()
                                .focus()
                                .setCellAttribute('borderTop', 'solid')
                                .setCellAttribute('borderBottom', 'solid')
                                .setCellAttribute('borderLeft', 'solid')
                                .setCellAttribute('borderRight', 'solid')
                                .run();
                        }
                    }}>
                    <i class="fas fa-border-all" /> Tutti i bordi
                </button>

                <div class="dropdown">
                    <button
                        class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2 dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                        <ArrowsOutCardinal size={14} weight="bold" class="mr-1" /> Bordo
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <div class="px-3 py-2">
                                <div class="border-type-group m-0 d-flex align-items-center" style="gap: 0.5rem;">
                                    <small class="text-dark font-weight-boldest min-w-2 mb-1">Superiore</small>
                                    <div class="btn-group">
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderTop', 'solid').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-top: 3px solid #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderTop', 'dashed').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-top: 3px dashed #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderTop', 'dotted').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-top: 3px dotted #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderTop', null).run()}>
                                            <TrashSimple size={14} weight="bold" class="text-danger" />
                                        </button>
                                    </div>
                                </div>
                                <div class="border-type-group m-0 d-flex align-items-center" style="gap: 0.5rem;">
                                    <small class="text-dark font-weight-boldest min-w-2 mb-1">Inferiore</small>
                                    <div class="btn-group">
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderBottom', 'solid').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-bottom: 3px solid #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .setCellAttribute('borderBottom', 'dashed')
                                                    .run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-bottom: 3px dashed #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .setCellAttribute('borderBottom', 'dotted')
                                                    .run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-bottom: 3px dotted #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderBottom', null).run()}>
                                            <TrashSimple size={14} weight="bold" class="text-danger" />
                                        </button>
                                    </div>
                                </div>
                                <div class="border-type-group m-0 d-flex align-items-center" style="gap: 0.5rem;">
                                    <small class="text-dark font-weight-boldest min-w-2 mb-1">Sinistra</small>
                                    <div class="btn-group">
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderLeft', 'solid').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-left: 3px solid #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderLeft', 'dashed').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-left: 3px dashed #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderLeft', 'dotted').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-left: 3px dotted #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderLeft', null).run()}>
                                            <TrashSimple size={14} weight="bold" class="text-danger" />
                                        </button>
                                    </div>
                                </div>
                                <div class="border-type-group d-flex align-items-center" style="gap: 0.5rem;">
                                    <small class="text-dark font-weight-boldest min-w-2 mb-1">Destra</small>
                                    <div class="btn-group">
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderRight', 'solid').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-right: 3px solid #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderRight', 'dashed').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-right: 3px dashed #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderRight', 'dotted').run()}>
                                            <div
                                                class="m-auto"
                                                style="width: 15px; height: 15px; background: #eee;border-right: 3px dotted #000;" />
                                        </button>
                                        <button
                                            class="mb-0 btn btn-icon btn-sm btn-ghost p-0"
                                            on:click={() =>
                                                editor.chain().focus().setCellAttribute('borderRight', null).run()}>
                                            <TrashSimple size={14} weight="bold" class="text-danger" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>

                <button
                    class="btn btn-white btn-sm font-weight-boldest btn-light p-1 mb-0 d-flex align-items-center gap-2"
                    on:click={() => {
                        editor
                            .chain()
                            .focus()
                            .setCellAttribute('borderTop', null)
                            .setCellAttribute('borderBottom', null)
                            .setCellAttribute('borderLeft', null)
                            .setCellAttribute('borderRight', null)
                            .run();
                    }}>
                    <Table size={14} weight="bold" class="mr-1 text-danger" /> Rimuovi bordi
                </button>
            </div>
        </div>
    {/if}
    <div class="editor-container" bind:this={element} id={Math.random().toString(36).substring(2, 15)} />
</div>

<svelte:head>
    <style>
        .page-break-before {
            margin-top: 5px;
            margin-bottom: 5px;
            width: 100%;
        }
        .page-break-before::before {
            content: 'Gli elementi sotto a questa linea andranno nella pagina successiva';
            font-size: 0.8rem;
            color: var(--primary);
            border-top: 1px dashed var(--primary);
            text-align: center;
            font-weight: 500;
            font-style: italic;
            justify-content: center;
            display: flex;
            width: 100%;
            padding-top: 5px;
            padding-bottom: 5px;
        }
        .tiptap :first-child {
            margin-top: 0;
        }

        .tiptap .mention {
            background: #5138e7eb;
            color: var(--white);
            font-weight: 500;
            border-radius: 1rem;
            padding: 0.1rem 0.5rem;
            outline: 1px solid #391edfeb;
            border-top: 1px solid #ffffff4a !important;
            font-size: 0.9rem;
        }

        .tiptap .mention::after {
            content: '\200B';
        }
        .tiptap p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
        .bubble-menu {
            background-color: var(--white);
            border: 1px solid #ebedf3;
            border-bottom: 0 !important;
            border-radius: 0 !important;
            box-shadow: var(--shadow);
            display: flex;
            padding: 0.2rem;
        }

        .bubble-menu button {
            background-color: unset;
        }

        .bubble-menu button:hover {
            background-color: var(--gray-3);
        }

        .bubble-menu button.is-active {
            background-color: var(--purple);
        }

        .bubble-menu button.is-active:hover {
            background-color: var(--purple-contrast);
        }
        .tiptap :first-child {
            margin-top: 0;
        }

        /* Table-specific styling */
        .tiptap table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;
        }

        .tiptap table td,
        .tiptap table th {
            border: 1px dashed #e8e8e89e;
            box-sizing: border-box;
            min-width: 1em;
            padding: 6px 8px;
            position: relative;
            vertical-align: top;
        }

        .tiptap table td > *,
        .tiptap table th > * {
            margin-bottom: 0;
        }

        .tiptap table th {
            background-color: #351dc205;
            font-weight: bold;
            text-align: left;
        }

        .tiptap table .selectedCell:after {
            background: #351dc21c;
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
        }

        .tiptap table .column-resize-handle {
            background-color: #351dc2;
            bottom: -2px;
            pointer-events: none;
            position: absolute;
            right: -2px;
            top: 0;
            width: 4px;
        }

        .tiptap .tableWrapper {
            margin: 1.5rem 0;
            overflow-x: auto;
        }

        .tiptap.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
        }
        .editor-toolbar {
            border: 1px solid #ebedf3;
            border-radius: 1rem 1rem 0 0 !important;
            border-bottom: none !important;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        button.active {
            background: black;
            color: white;
        }
        .editor-container {
            border: 1px solid #ebedf3;
            border-radius: 0 0 1rem 1rem !important;
        }
        .editor-container > div {
            padding: 1rem;
        }
        .editor-container > div:focus,
        .editor-container > div:focus-visible {
            border-radius: 0 0 1rem 1rem !important;
            outline: 2px solid #1400912b;
        }
        .tiptap p {
            margin: 0;
        }

        /* .tableWrapper table,
        .tableWrapper td,
        .tableWrapper th {
            border: 1px solid #ebedf3;
        } */

        /* Task list specific styles */
        .tiptap ul[data-type='taskList'] {
            list-style: none;
            margin-left: 0;
            padding: 0;

            li {
                align-items: flex-start;
                display: flex;

                > label {
                    flex: 0 0 auto;
                    margin-right: 0.5rem;
                    user-select: none;
                }

                > div {
                    flex: 1 1 auto;
                }
            }

            input[type='checkbox'] {
                cursor: pointer;
            }

            ul[data-type='taskList'] {
                margin: 0;
            }
        }
        /* Border styles for table cells based on attributes */
        .tiptap td[borderright='solid'],
        .tiptap th[borderright='solid'] {
            border-right: 1px solid #aaa !important;
        }
        .tiptap td[borderright='dashed'],
        .tiptap th[borderright='dashed'] {
            border-right: 1px dashed #aaa !important;
        }
        .tiptap td[borderright='dotted'],
        .tiptap th[borderright='dotted'] {
            border-right: 1px dotted #aaa !important;
        }

        .tiptap td[bordertop='solid'],
        .tiptap th[bordertop='solid'] {
            border-top: 1px solid #aaa !important;
        }
        .tiptap td[bordertop='dashed'],
        .tiptap th[bordertop='dashed'] {
            border-top: 1px dashed #aaa !important;
        }
        .tiptap td[bordertop='dotted'],
        .tiptap th[bordertop='dotted'] {
            border-top: 1px dotted #aaa !important;
        }

        .tiptap td[borderleft='solid'],
        .tiptap th[borderleft='solid'] {
            border-left: 1px solid #aaa !important;
        }
        .tiptap td[borderleft='dashed'],
        .tiptap th[borderleft='dashed'] {
            border-left: 1px dashed #aaa !important;
        }
        .tiptap td[borderleft='dotted'],
        .tiptap th[borderleft='dotted'] {
            border-left: 1px dotted #aaa !important;
        }

        .tiptap td[borderbottom='solid'],
        .tiptap th[borderbottom='solid'] {
            border-bottom: 1px solid #aaa !important;
        }
        .tiptap td[borderbottom='dashed'],
        .tiptap th[borderbottom='dashed'] {
            border-bottom: 1px dashed #aaa !important;
        }
        .tiptap td[borderbottom='dotted'],
        .tiptap th[borderbottom='dotted'] {
            border-bottom: 1px dotted #aaa !important;
        }

        .tiptap p,
        .tiptap h1,
        .tiptap h2,
        .tiptap h3 {
            padding-top: 3px;
            padding-bottom: 3px;
        }

        .tiptap p.no-padding,
        .tiptap h1.no-padding,
        .tiptap h2.no-padding,
        .tiptap h3.no-padding {
            padding-top: 0px !important;
            padding-bottom: 0px !important;
        }

        .tiptap img {
            max-width: 100%;
            height: auto;
        }
    </style>
</svelte:head>
