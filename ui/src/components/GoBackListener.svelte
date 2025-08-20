<script>
    import {onMount, onDestroy} from 'svelte';
    import {push} from 'svelte-spa-router'; // In case you need to programmatically navigate

    export let changes = false; // Change this condition when form is edited or other criteria met

    onMount(() => {
        const warnUser = event => {
            if (changes) {
                event.preventDefault();
                event.returnValue = ''; // This triggers the confirmation dialog
            }
        };

        const handlePopState = event => {
            if (changes && !confirm('Hai modifiche non salvate. Sei sicuro di voler uscire?')) {
                // Re-push the current URL to prevent navigation
                push(location.pathname);
            }
        };

        // Listen for browser back button and refresh warnings
        window.addEventListener('beforeunload', warnUser);
        window.addEventListener('popstate', handlePopState);
    });

    onDestroy(() => {
        // Cleanup the event listeners
        window.removeEventListener('beforeunload', warnUser);
        window.removeEventListener('popstate', handlePopState);
    });
</script>
