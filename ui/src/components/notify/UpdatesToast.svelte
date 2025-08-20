<script>
    import {fly} from 'svelte/transition';
    import {TrafficSign, X} from 'phosphor-svelte';
    import {onMount} from 'svelte';
    import Portal from 'svelte-portal';
    import * as easing from 'svelte/easing';

    export let show = false;
    let seen = false;
    let message = '';

    onMount(() => {
        setTimeout(() => {
            // check localStorage items existence, if not, create them
            if (!localStorage.getItem('seenUpdatesToast')) {
                localStorage.setItem(
                    'seenUpdatesToast',
                    JSON.parse(localStorage.getItem('role')) == 'association' ? false : true
                );
            }

            localStorage.setItem('updatesMessage', __bakney.build.RELEASE_NOTES_UI);

            // read from localStorage to check if the user has already seen the toast
            seen = JSON.parse(localStorage.getItem('seenUpdatesToast'));

            // if the user has already seen the toast or random 40% chance not met, don't show it again
            let shouldShow = Math.random() > 0.4;
            if (seen || shouldShow) return;

            // read the updates message from localStorage
            message = localStorage.getItem('updatesMessage');

            // if there is no message, don't show the toast
            if (!message) return;

            // show the toast only if logged in
            let isLogged = localStorage.getItem('sessionToken');
            if (isLogged && isLogged != 'null') show = true;
        }, 5000);
    });
</script>

<Portal>
    {#if show}
        <div
            in:fly={{delay: 1000, duration: 1000, y: 600, easing: easing.elasticInOut}}
            out:fly={{duration: 250, x: 600}}
            class="update-toast bg-primary text-white font-weight-bold">
            <!-- It has an header with an X button, a body and a footer -->
            <div class="d-flex justify-content-between align-items-center pt-2 pb-2">
                <h3 class="font-weight-boldest">🎉 <span class="ml-3">Novità {__bakney.build.VERSION}</span></h3>
                <button
                    class="btn btn-sm btn-ghost font-weight-bolder p-0"
                    on:click={() => {
                        // when the user clicks on the X button, set the seen flag to true and clear message
                        localStorage.setItem('seenUpdatesToast', true);
                        // hide the toast
                        show = false;
                    }}>
                    <X size="1.5rem" color="#fff" />
                </button>
            </div>
            <!-- The body contains the message -->

            <div class="text-white line-height-lg update-toast-body mt-0 mb-4">
                <p>
                    {@html __bakney.build.RELEASE_NOTES_UI}
                </p>
            </div>
            <!-- The footer contains a button to dismiss the toast -->

            <div class="d-flex justify-content-between align-items-center pb-2">
                <a href="https://bakney.com/roadmap" target="_blank" class="text-white font-weight-bolder my-auto ml-0">
                    <TrafficSign size={18} class="mr-1" weight="duotone" />
                    Scopri la nostra roadmap
                </a>
                <button
                    class="btn btn-sm btn-light font-weight-bolder text-primary mb-0"
                    on:click={() => {
                        // when the user clicks on the dismiss button, set the seen flag to true
                        localStorage.setItem('seenUpdatesToast', true);
                        // hide the toast
                        show = false;
                    }}>
                    Ok, grazie 🙏
                </button>
            </div>
        </div>
    {/if}
</Portal>

<svelte:head>
    <style>
        /* Update Toast 
        *  This is a fixed positioned toast that will be shown when there are updates
        *  for the application. It will be shown only once per session, it will a non invasive popup on the bottom right of the screen.
        *  It has a padding rounded border and a drop shadow diffused, to make it modern and nice.
        */
        @media (max-width: 991.98px) {
            /* on mobile remove margin fro update-toast */
            .update-toast {
                max-width: 25rem !important;
                min-width: 25rem !important;
                margin: 1rem !important;
            }
        }
        .update-toast {
            position: fixed;
            bottom: 0;
            right: 0;
            margin: 2rem;
            padding: 0.6rem 1.2rem;
            border-radius: 1.5rem;
            background-color: #fff;
            box-shadow: 0 0.25rem 5rem 0 rgba(0, 0, 0, 0.5);
            z-index: 9999;
            min-width: 30rem;
            width: 100%;
            max-width: 30rem;
            opacity: 0.98 !important;
        }
        .update-toast-body {
            padding: 0.5rem;
            border-radius: 0.55rem;
            overflow-y: auto;
            max-height: 25rem;
            height: 25rem;
            font-weight: bold;
        }

        /* width */
        .update-toast-body::-webkit-scrollbar {
            width: 5px;
            border-radius: 0.55rem;
        }

        /* Track */
        .update-toast-body::-webkit-scrollbar-track {
            background: #f1f1f100;
        }

        /* Handle */
        .update-toast-body::-webkit-scrollbar-thumb {
            background: #ffffff70;
            border-radius: 0.55rem;
        }

        /* Handle on hover */
        .update-toast-body::-webkit-scrollbar-thumb:hover {
            background: #ccc;
        }

        .update-toast a {
            color: #fffc00;
            font-weight: 800;
            text-decoration: underline;
        }
    </style>
</svelte:head>
