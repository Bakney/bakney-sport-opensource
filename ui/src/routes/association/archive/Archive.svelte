<script>
    import {scale} from 'svelte/transition';
    import {role, currentPage} from 'store/stores.js';
    import * as easing from 'svelte/easing';
    import {
        ArrowSquareOut,
        CheckCircle,
        CheckSquare,
        CopySimple,
        File,
        FolderSimple,
        FolderSimpleDashed,
        FolderSimplePlus,
        Sparkle,
        TrashSimple,
        UploadSimple,
    } from 'phosphor-svelte';
    import NavigationTab from './shared/NavigationTab.svelte';
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import {toast} from 'svelte-sonner';
    import {toBase64Safe} from 'utils/Functions';
    import {onMount} from 'svelte';
    import FolderModal from './modals/FolderModal.svelte';
    import {Circle} from 'svelte-loading-spinners';
    import GenerateFromTemplateModal from './modals/GenerateFromTemplateModal.svelte';

    role.useLocalStorage();

    let currentFileList = [];
    let currentFoldersList = [];
    let selectedFiles = [];
    let currentFolder = null;
    let parent = null;
    let pathToFolder = null;
    let infiniteScrollPage = 0;
    let totalItems = 0;
    let hadNextPage = false;
    let isLoading = false;

    function resetSelection() {
        selectedFiles = [];
    }

    async function fetchData(folder = null) {
        isLoading = true;

        // reset selection and such
        resetSelection();

        let res = await apiFetch(
            `${__bakney.env.API.DOCUMENTS.LIST}${
                folder !== null ? `?folder=${folder}&page=${infiniteScrollPage}` : `?page=${infiniteScrollPage}`
            }`
        );

        if (res.status == 200 || res.status == 201) {
            if (infiniteScrollPage == 0) {
                currentFileList = res.response.data;
            } else {
                currentFileList = [...currentFileList, ...res.response.data];
            }

            totalItems = res.response.pagination?.total_items || 0;

            // Handle pagination data
            hadNextPage = res.response.pagination?.has_next || false;

            // If no data returned and we're on a page after 0, likely reached the end
            if (res.response.data.length === 0 && infiniteScrollPage > 0) {
                hadNextPage = false;
            }
        } else {
            toast.error('Errore durante il caricamento dei file.');
        }

        if (infiniteScrollPage == 0) {
            res = await apiFetch(`${__bakney.env.API.FOLDERS.LIST}${folder !== null ? '?folder=' + folder : ''}`);

            if (res.status == 200 || res.status == 201) {
                currentFoldersList = res.response.data;
                pathToFolder = res.response?.path ?? null;
            } else {
                toast.error('Errore durante il caricamento delle cartelle.');
            }
        }

        currentFolder = folder;

        isLoading = false;
    }

    async function uploadFiles(files, folder = null) {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Caricamento, non chiudere questa pagina...',
        });

        // convert files to array
        files = Array.from(files);

        const documentPromises = Array.from(files).map(async file => {
            const base64 = await toBase64Safe(file);
            return {
                document: base64,
                filename: file.name,
            };
        });
        files = await Promise.all(documentPromises);
        files = files.filter(x => x.document != '');

        const res = await apiFetch(__bakney.env.API.DOCUMENTS.ADD, {
            method: 'POST',
            body: JSON.stringify({
                files: files,
                folder: folder,
            }),
        });

        if (res.status == 200 || res.status == 201) {
            fetchData(folder);

            toast.success('File caricati con successo.');
        } else {
            toast.error('Errore durante il caricamento dei file.');
        }
        KTApp.unblockPage();
    }

    function handleScroll() {
        if (hadNextPage && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            infiniteScrollPage++;
            fetchData(currentFolder);
        }
    }

    onMount(async () => {
        infiniteScrollPage = 0;
        await fetchData();
        document.addEventListener('scroll', handleScroll);
    });
</script>

<!--begin::Entry-->
<div in:scale|local={{duration: 100, start: 0.98, easing: easing.cubicInOut}} class="d-flex flex-column-fluid">
    <!--begin::Container-->
    <div class="container">
        <!--begin::Profile Personal Information-->
        <div class="row" style="min-height: 95%;">
            <div class="col-lg-12">
                <NavigationTab />
                {#if $currentPage == 'archive'}
                    <div class="card card-custom card-stretch">
                        <div class="card-header p-0 border-0">
                            <div class="card-title">
                                <h3 id="title-report" class="card-label font-size-h2">
                                    <span id="title-description-report">Documenti</span>
                                    <span
                                        id="title-description-balance-sheet"
                                        class="d-block text-muted pt-2 font-size-sm"
                                        >Gestisci tutti i tuoi documenti e file in un unico posto.</span>
                                </h3>
                            </div>
                            <div class="card-toolbar" style="gap: .5rem;">
                                <button
                                    class="btn btn-light-primary font-weight-boldest d-flex align-items-center"
                                    on:click={() => {
                                        let generateFromTemplateModal = new GenerateFromTemplateModal({
                                            target: document.body,
                                            props: {
                                                show: true,
                                                additionalData: {
                                                    parent: currentFolder,
                                                },
                                            },
                                        });

                                        generateFromTemplateModal.$on('update', () => {
                                            infiniteScrollPage = 0;
                                            fetchData(currentFolder);
                                            generateFromTemplateModal.$destroy();
                                        });
                                    }}>
                                    <Sparkle size={18} weight="bold" class="mr-2" />
                                    Genera da Modello
                                </button>
                                <button
                                    class="btn btn-primary font-weight-boldest mr-2 d-flex align-items-center"
                                    on:click={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.onchange = e => {
                                            const files = e.target.files;
                                            uploadFiles(files, currentFolder);
                                        };
                                        input.click();
                                    }}>
                                    <UploadSimple size={18} weight="bold" class="mr-2" />
                                    Carica Documenti
                                </button>
                            </div>
                        </div>
                        <div class="card-body mx-0 p-0">
                            <div
                                id="upload-area"
                                role="region"
                                aria-label="Area caricamento file"
                                class="d-flex flex-column align-items-center justify-content-start p-0 rounded-xl h-100 border"
                                on:dragover|preventDefault={e => {
                                    document.getElementById('upload-area').classList.add('dragover');
                                }}
                                on:dragleave|preventDefault={e => {
                                    document.getElementById('upload-area').classList.remove('dragover');
                                }}
                                on:drop|preventDefault={e => {
                                    const files = e.dataTransfer.files;
                                    document.getElementById('upload-area').classList.remove('dragover');
                                    uploadFiles(files, currentFolder);
                                }}>
                                <div class="d-flex align-items-center justify-content-between w-100 pt-4 px-4">
                                    <div class="d-flex align-items-center justify-content-between gap-2 w-100">
                                        <div class="d-flex align-items-center gap-2" style="gap: .5rem;">
                                            <button
                                                class="btn btn-sm btn-outline-secondary font-weight-bold d-flex align-items-center mb-0 py-1 px-2"
                                                on:click={() => {
                                                    // Handle select all
                                                    if (selectedFiles.length == 0) {
                                                        selectedFiles = currentFileList;
                                                    } else {
                                                        selectedFiles = [];
                                                    }
                                                }}>
                                                <CheckSquare size={18} weight="bold" class="mr-2" />
                                                {#if selectedFiles.length == 0}
                                                    Seleziona Tutto
                                                {:else}
                                                    Deseleziona Tutto
                                                {/if}
                                            </button>
                                            {#if selectedFiles.length > 0}
                                                <button
                                                    class="btn btn-sm btn-danger font-weight-bold d-flex align-items-center mb-0 py-1 px-2"
                                                    on:click={async () => {
                                                        // Handle delete selected
                                                        const result = await swal.fire({
                                                            title: 'Sei sicuro?',
                                                            text: 'Questa azione non può essere annullata.',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Elimina',
                                                            cancelButtonText: 'Annulla',
                                                            reverseButtons: true,
                                                            customClass: {
                                                                confirmButton: 'btn btn-danger',
                                                                cancelButton: 'btn btn-secondary',
                                                            },
                                                        });

                                                        if (result.isConfirmed) {
                                                            KTApp.blockPage({
                                                                overlayColor: '#000000',
                                                                state: 'primary',
                                                                message: 'Eliminazione in corso...',
                                                            });

                                                            console.info(selectedFiles);

                                                            const res = await apiFetch(
                                                                __bakney.env.API.DOCUMENTS.BULK_DELETE,
                                                                {
                                                                    method: 'DELETE',
                                                                    body: JSON.stringify({
                                                                        files: selectedFiles.map(
                                                                            f =>
                                                                                f.sport_association_documents_archive_id
                                                                        ),
                                                                    }),
                                                                }
                                                            );

                                                            if (
                                                                res.status === 200 ||
                                                                res.status === 201 ||
                                                                res.status === 204
                                                            ) {
                                                                toast.success('File eliminati con successo');
                                                                selectedFiles = [];
                                                                await fetchData();
                                                            } else {
                                                                toast.error("Errore durante l'eliminazione dei file");
                                                            }

                                                            KTApp.unblockPage();
                                                        }
                                                    }}>
                                                    <TrashSimple size={18} weight="bold" class="mr-2" />
                                                    Elimina ({selectedFiles.length})
                                                </button>
                                            {/if}
                                        </div>

                                        <button
                                            class="btn btn-sm btn-dark font-weight-bold align-items-center mb-0 py-1 px-2"
                                            on:click={() => {
                                                // Handle create folder
                                                let addFolderModal = new FolderModal({
                                                    target: document.body,
                                                    props: {
                                                        show: true,
                                                        data: {
                                                            parent: currentFolder,
                                                        },
                                                    },
                                                });
                                                addFolderModal.$on('update', () => {
                                                    infiniteScrollPage = 0;
                                                    fetchData(currentFolder);
                                                });
                                            }}>
                                            <FolderSimplePlus size={18} weight="bold" class="mr-2" />
                                            Nuova Cartella
                                        </button>
                                    </div>
                                </div>
                                <div
                                    class="d-flex flex-column align-items-center justify-content-start mt-6"
                                    style="height: 100%;width: 100%;">
                                    <div
                                        class="d-flex justify-content-between align-items-center w-100 font-weight-boldest font-size-h6 mb-2 px-4">
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div class="d-flex align-items-center justify-content-start gap-2">
                                            <span
                                                class="cursor-pointer text-hover-primary text-underline"
                                                on:click={() => {
                                                    infiniteScrollPage = 0;
                                                    fetchData();
                                                }}>Il mio archivio</span>
                                            {#if currentFolder}
                                                <div class="d-flex align-items-center ml-2">
                                                    <span class="text-muted font-weight-bold mx-2">/</span>
                                                    {#if pathToFolder}
                                                        {#each Array.from(pathToFolder || []) as folder}
                                                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                            <span
                                                                class="cursor-pointer text-hover-primary text-underline"
                                                                on:click={() => {
                                                                    infiniteScrollPage = 0;
                                                                    fetchData(folder.id);
                                                                }}>{folder.name}</span>
                                                            <span class="text-muted font-weight-bold mx-2">/</span>
                                                        {/each}
                                                    {/if}
                                                </div>
                                            {/if}
                                        </div>

                                        <div class="d-flex align-items-center justify-content-end gap-2">
                                            <span class="text-muted font-weight-bold font-size-xs">
                                                {totalItems} file
                                            </span>
                                        </div>
                                    </div>
                                    {#if currentFileList?.length > 0 || currentFoldersList?.length > 0}
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div class="d-flex flex-wrap p-0 w-100">
                                            <div
                                                class="d-flex align-items-center w-100 px-0 py-2 px-4 border-bottom border-top">
                                                <span class="text-dark font-weight-boldest">Nome</span>
                                                <span class="text-dark font-weight-boldest ml-auto">Azioni</span>
                                            </div>
                                            {#if currentFoldersList?.length > 0}
                                                {#each currentFoldersList as item, index}
                                                    <!-- Folder -->
                                                    <div
                                                        class="d-flex align-items-center justify-content-between w-100 px-0 py-1 px-3 cursor-pointer item-archive border-bottom"
                                                        on:click={() => {
                                                            parent = currentFolder;
                                                            infiniteScrollPage = 0;
                                                            fetchData(item.id, parent);
                                                        }}>
                                                        <div
                                                            class="d-flex align-items-center text-dark font-weight-bolder font-size-md">
                                                            <FolderSimple
                                                                size={16}
                                                                weight="bold"
                                                                class="text-dark-75 mr-3" />
                                                            {item.name}
                                                        </div>

                                                        <div>
                                                            <button
                                                                class="btn btn-sm px-1 py-1 m-0 text-danger"
                                                                on:click|stopPropagation={async () => {
                                                                    const result = await swal.fire({
                                                                        title: 'Sei sicuro?',
                                                                        text: 'Questa azione non può essere annullata',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Elimina',
                                                                        cancelButtonText: 'Annulla',
                                                                        reverseButtons: true,
                                                                        customClass: {
                                                                            confirmButton: 'btn btn-danger',
                                                                            cancelButton: 'btn btn-secondary',
                                                                        },
                                                                    });

                                                                    if (result.isConfirmed) {
                                                                        const res = await apiFetch(
                                                                            replaceUID(
                                                                                __bakney.env.API.FOLDERS.DELETE,
                                                                                item.id
                                                                            ),
                                                                            {
                                                                                method: 'DELETE',
                                                                            }
                                                                        );

                                                                        if (res.status === 200 || res.status === 204) {
                                                                            infiniteScrollPage = 0;
                                                                            fetchData(currentFolder);
                                                                            toast.success(
                                                                                'Cartella eliminata con successo'
                                                                            );
                                                                        } else {
                                                                            toast.error(
                                                                                "Errore nell'eliminazione della cartella"
                                                                            );
                                                                        }
                                                                    }
                                                                }}>
                                                                <TrashSimple size={16} weight="bold" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                {/each}
                                            {/if}
                                            {#if currentFileList?.length > 0}
                                                {#each currentFileList as item, index}
                                                    <!-- File -->
                                                    <div
                                                        class="d-flex align-items-center justify-content-between w-100 px-0 py-1 px-3 cursor-pointer item-archive border-bottom"
                                                        on:click={() => {
                                                            // Handle file selection
                                                            const index = selectedFiles.findIndex(
                                                                f =>
                                                                    f.sport_association_documents_archive_id ===
                                                                    item.sport_association_documents_archive_id
                                                            );
                                                            if (index === -1) {
                                                                selectedFiles = [...selectedFiles, item];
                                                            } else {
                                                                selectedFiles = selectedFiles.filter(
                                                                    f =>
                                                                        f.sport_association_documents_archive_id !==
                                                                        item.sport_association_documents_archive_id
                                                                );
                                                            }
                                                        }}>
                                                        <div
                                                            class="d-flex align-items-center text-dark font-weight-bolder font-size-md">
                                                            <div class="position-relative mr-3">
                                                                <File size={16} weight="bold" class="text-dark-75" />
                                                                {#if selectedFiles.some(f => f.sport_association_documents_archive_id === item.sport_association_documents_archive_id)}
                                                                    <div
                                                                        class="position-absolute bg-white rounded-xl"
                                                                        style="top: -6px; right: -6px;">
                                                                        <CheckCircle
                                                                            size={18}
                                                                            weight="fill"
                                                                            class="text-success" />
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                            <div class="text-dark font-weight-bolder font-size-md">
                                                                {item.document.filename}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <button
                                                                class="btn btn-sm px-1 py-1 m-0 text-dark-60"
                                                                on:click|stopPropagation={() => {
                                                                    const link = `${__bakney.env.API.DOCUMENT.RETRIEVE}/${item.document.document_id}?token=${item.document.token}&download=true`;
                                                                    navigator.clipboard.writeText(link);
                                                                    toast.success('Link copiato negli appunti');
                                                                }}>
                                                                <CopySimple size={16} weight="bold" />
                                                            </button>
                                                            <button
                                                                class="btn btn-sm px-1 py-1 m-0 text-dark-60"
                                                                on:click|stopPropagation={() => {
                                                                    window.open(
                                                                        `${__bakney.env.API.DOCUMENT.RETRIEVE}/${item.document.document_id}?token=${item.document.token}&download=true`,
                                                                        '_blank'
                                                                    );
                                                                }}>
                                                                <ArrowSquareOut size={16} weight="bold" />
                                                            </button>
                                                            <button
                                                                class="btn btn-sm px-1 py-1 m-0 text-danger"
                                                                on:click|stopPropagation={async () => {
                                                                    const result = await swal.fire({
                                                                        title: 'Sei sicuro?',
                                                                        text: 'Questa azione non può essere annullata',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Elimina',
                                                                        cancelButtonText: 'Annulla',
                                                                        reverseButtons: true,
                                                                        customClass: {
                                                                            confirmButton: 'btn btn-danger',
                                                                            cancelButton: 'btn btn-secondary',
                                                                        },
                                                                    });

                                                                    if (result.isConfirmed) {
                                                                        const res = await apiFetch(
                                                                            replaceUID(
                                                                                __bakney.env.API.DOCUMENTS.DELETE,
                                                                                item.sport_association_documents_archive_id
                                                                            ),
                                                                            {
                                                                                method: 'DELETE',
                                                                            }
                                                                        );

                                                                        if (res.status === 200 || res.status === 204) {
                                                                            infiniteScrollPage = 0;
                                                                            fetchData(currentFolder);
                                                                            toast.success(
                                                                                'File eliminato con successo'
                                                                            );
                                                                        } else {
                                                                            toast.error(
                                                                                "Errore nell'eliminazione del file"
                                                                            );
                                                                        }
                                                                    }
                                                                }}>
                                                                <TrashSimple size={16} weight="bold" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                {/each}
                                            {/if}
                                        </div>
                                    {/if}
                                    {#if isLoading}
                                        <div
                                            class="d-flex flex-column align-items-center justify-content-center p-20 my-auto">
                                            <Circle size="32" color="#351DC2" unit="px" duration="0.5s" />
                                        </div>
                                    {/if}
                                    {#if currentFileList?.length == 0}
                                        <div
                                            class="d-flex flex-column align-items-center justify-content-center p-20 my-auto">
                                            <FolderSimpleDashed size={64} weight="duotone" class="text-dark-50" />
                                            <span class="text-dark-50 font-weight-bold">Nessun file caricato.</span>
                                        </div>
                                    {/if}
                                </div>
                                <div class="text-center">
                                    <div class="font-weight-bold text-muted mb-2">Trascina qui i file da caricare.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            <!--end::Content-->
        </div>
        <!--end::Profile Personal Information-->
    </div>
    <!--end::Container-->
</div>
<!--end::Entry-->

<svelte:head>
    <style>
        .dragover {
            outline: 0.2rem solid var(--primary);
            background-color: #f3f6f9 !important;
        }
        .item-archive:hover {
            background-color: #f3f6f9 !important;
        }
        /* .dropzone {
            border: 2px dashed #E1E3EA;
            border-radius: 0.42rem;
            cursor: pointer;
            min-height: 150px;
            transition: all 0.3s ease;
        }

        .dropzone:hover, .dropzone:global(.dragover) {
            border: 2px dashed var(--primary);
        } */
    </style>
</svelte:head>
