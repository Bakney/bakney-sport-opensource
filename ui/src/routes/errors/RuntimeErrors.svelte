<script>
    import {ArrowClockwise, SmileySad} from 'phosphor-svelte';
    import {onMount} from 'svelte';

    onMount(() => {
        localStorage.clear();
    });
</script>

<div class="row" style="height: 100%;overflow-x:hidden">
    <div
        class="col-12"
        style="height: 100%; margin: auto; display: flex; flex-direction: column; justify-content: center;align-items: center;">
        <div class="d-flex justify-content-center pt-10">
            <!-- svelte-ignore a11y-missing-attribute -->
            <SmileySad size={200} weight="duotone" />
        </div>
        <div class="d-flex justify-content-center flex-column pt-10" style="max-width: 35rem">
            <div class="text-center pb-6 font-weight-bolder" style="font-size:2rem">Ops, qualcosa è andato storto!</div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a
                class="btn btn-primary btn-lg font-weight-bolder m-auto d-flex justify-content-center align-items-bottom"
                on:click={() => {
                    window.location.href = '/#/login';
                }}
                style="width: 80%;margin-top: .5rem !important;">
                <span class="mr-2"><ArrowClockwise size={18} weight="duotone" /></span>
                Ricarica l'applicazione
            </a>
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
