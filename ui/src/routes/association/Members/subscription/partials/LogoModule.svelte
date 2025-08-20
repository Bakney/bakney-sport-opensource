<script>
    export let userData;

    export let files;

    const removeProfilePic = function () {
        files = undefined;
        userData.sport_association.logo = null;
    };
</script>

<div class="row">
    <div class="col-12">
        <h5 class="font-weight-bolder font-size-h2">Logo con firma del presidente</h5>
    </div>
</div>
<div class="form-group row justify-content-between">
    <div class="col-lg-8 col-xl-8 pt-2 pr-8" id="sport_association_logo_template">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="image-input image-input-outline"
            id="kt_profile_avatar"
            style="width:100%;height:10rem;cursor:pointer"
            on:click={() => {
                // document.querySelector('#kt_profile_avatar > label').click();
            }}>
            {#if files && files[0]}
                <div
                    class="image-input-wrapper border rounded-lg"
                    style="width:100%;height:10rem;background-size:auto;background-image: url({window.URL.createObjectURL(
                        files[0]
                    )})" />
            {:else}
                <div
                    class="image-input-wrapper border rounded-lg"
                    style="width:100%;height:10rem;background-size:contain;background-image: url({userData
                        ?.sport_association?.logo != null
                        ? userData?.sport_association?.logo
                        : '/static/placeholder_logo.png'})" />
            {/if}
            <label
                class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary border"
                data-action="change"
                data-toggle="tooltip"
                title=""
                data-original-title="Cambia logo">
                <i class="fa fa-pen icon-sm text-muted" />
                <input type="file" accept=".png, .jpg, .jpeg" style="display:contents" bind:files />
                <input type="hidden" name="profile_avatar_remove" />
            </label>
            <span
                class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary border"
                on:click={() => removeProfilePic()}
                data-action="remove"
                data-toggle="tooltip"
                title="Rimuovi logo">
                <i class="ki ki-bold-close icon-xs text-muted" />
            </span>
        </div>
    </div>

    <div class="font-size-md text-dark-75 col-12">
        Inserisci un immagine di dimensione consigliate 590 x 130px. <br />Se l'immagine risulta tagliata, provare a
        premere su <strong>Anteprima</strong> per vedere il risultato.
    </div>
</div>
