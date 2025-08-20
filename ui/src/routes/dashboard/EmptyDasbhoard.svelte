<script>
    import {HandWaving} from 'phosphor-svelte';
    import {userData} from 'store/stores';
    import {onMount} from 'svelte';

    userData.useLocalStorage();

    onMount(() => {
        console.info('userData', $userData);
    });
</script>

<div class="d-flex flex-column justify-content-center align-items-center w-full h-full" style="height:100%;">
    <div class="d-flex flex-column justify-content-center align-items-center bg-white p-10 rounded-xl shadow-xl">
        <HandWaving size={84} weight="duotone" class="text-primary" />

        <h1 class="font-weight-bolder text-dark mt-10">Ciao {String($userData.first_name).toLocaleLowerCase()}!</h1>
        <p class="text-muted font-size-lg font-weight-bolder text-center">
            Non ci sono dati da visualizzare in questa pagina. <br />
            Utilizza il menu a sinistra per trovare quello che cerchi.
        </p>
    </div>

    <div class="d-flex flex-column justify-content-center align-items-center mt-20" />
</div>
