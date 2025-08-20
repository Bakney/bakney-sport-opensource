<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware';
    import Portal from 'svelte-portal';
    import PermissionsComponent from 'components/PermissionsComponent.svelte';
    import {onMount} from 'svelte';
    import {toast} from 'svelte-sonner';

    export let id;
    export let row;
    export let datatable;

    onMount(() => {
        if (row.collaborator_permissions == null) {
            row.collaborator_permissions = [];
        }
    });

    async function update() {
        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Modifica conto...',
        });

        const url = replaceUID(__bakney.env.API.COLLABORATORS.UPDATE, row.user_id);

        let data = {
            collaborator_role: row.collaborator_role,
            collaborator_permissions: row.collaborator_permissions,
        };

        const res = await apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        // spinner stop
        KTApp.unblockPage();

        if (res.status == 200) {
            datatable.reload();
            toast.success('Collaboratore con successo.');
        } else {
            swal.fire({
                text: 'Scusa, ho individuato degli errori, riprova.',
                icon: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Ok, capito!',
                customClass: {
                    confirmButton: 'btn font-weight-bold btn-light-primary',
                },
            }).then(function () {
                KTUtil.scrollTop();
            });
        }
    }
</script>

<!-- svelte-ignore missing-declaration -->
<Portal target="#portal-elements">
    <!-- Modal-->
    <form class="form" id="collaborator_form_{id}" on:submit|preventDefault={update}>
        <div
            class="modal fade"
            id="editModal-{id}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modifica collaboratore</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="form-group">
                                <!-- svelte-ignore a11y-label-has-associated-control -->
                                <label>Permessi<b>*</b></label>
                                <select
                                    name="collaborator_role"
                                    bind:value={row.collaborator_role}
                                    class="form-control form-control-solid form-control-lg margin-t-2"
                                    placeholder="Ruolo">
                                    <option value={1} selected="selected">Accesso Completo</option>
                                    <!-- <option value={2}>Commercialista</option> -->
                                    <option value={3}>Personalizzato</option>
                                </select>
                            </div>
                        </div>

                        {#if row.collaborator_role == 3}
                            <!--  checkbox with collaboration to mark as JSON -->
                            <div>
                                <div class="form-group">
                                    <!-- svelte-ignore a11y-label-has-associated-control -->
                                    <label>Permessi del collaboratore<b>*</b></label>

                                    <PermissionsComponent
                                        bind:currentCollaboratorPermissions={row.collaborator_permissions} />
                                </div>
                            </div>
                        {/if}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light-primary font-weight-bold" data-dismiss="modal"
                            >Chiudi</button>
                        <button type="submit" class="btn btn-primary font-weight-bold">Salva</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</Portal>
