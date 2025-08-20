<script>
    import {onMount} from 'svelte';

    export let params;

    onMount(() => {
        localStorage.clear();
        sessionStorage.setItem('collaboratorToken', params?.token);
        sessionStorage.setItem('isCollaborator', true);
    });
</script>

<div class="row" style="height: 100%;overflow-x:hidden">
    <div
        class="col-12"
        style="height: 100%; margin: auto; display: flex; flex-direction: column; justify-content: center;align-items: center;">
        <div class="d-flex justify-content-center pt-10">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={__bakney?.OEM_CONFIG?.newCollaboratorIcon} style="width: 80%; max-width: 35rem" />
        </div>
        <div class="d-flex justify-content-center flex-column pt-10" style="max-width: 35rem">
            <div class="text-center pb-6 font-weight-bolder" style="font-size:2rem">
                Benvenuto su {__bakney?.OEM_CONFIG?.name}
            </div>
            <button
                class="btn btn-primary btn-lg font-weight-bolder m-auto"
                on:click={() => {
                    window.location.href = '/#/login?page=signup_athlete';
                }}
                style="width: 80%;">Crea un account collaboratore</button>
        </div>
    </div>
</div>

<svelte:head>
    <style>
        #kt_body {
            overflow-x: hidden !important;
        }
    </style>
</svelte:head>
