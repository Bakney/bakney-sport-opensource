<script>
    import {scale, fly} from 'svelte/transition';
    import * as easing from 'svelte/easing';
    import Portal from 'svelte-portal';
    import {userData} from 'store/stores.js';
    import {onMount} from 'svelte';
    import {
        MagnifyingGlass,
        User,
        X,
        PersonSimple,
    } from 'phosphor-svelte';
    import {apiFetch} from 'utils/ApiMiddleware';
    import {push} from 'svelte-spa-router';

    userData.useLocalStorage();

    export let id = 'smart-command-modal';
    export let show = true;
    let searchValue = '';
    let searchResults = {
        users_match: [],
        sport_associations_match: [],
        message: '',
    };
    let searching = false;

    $: show, focusSearch();
    $: searchValue, updateToolsAndSearch();

    async function updateToolsAndSearch(forceSearch = false) {
        searchResults = {
            users_match: [],
            sport_associations_match: [],
            message: '',
        };

        // perform search if removing initial command: or only :
        let query = searchValue.replace(':', '').trim();
        if ((query.length > 3) || forceSearch) {
            searching = true;
            // perform search
            let res = await apiFetch(
                `${__bakney.env.API.SEARCH.ALL}?q=${searchValue}`
            );
            if (!res.error) {
                searchResults = {
                    users_match: res.response?.data?.users_match || [],
                    sport_associations_match: res.response?.data?.sport_associations_match || [],
                    message: res.response?.data?.message || '',
                };
            } else {
                searchResults = {
                    users_match: [],
                    sport_associations_match: [],
                    message: 'Nessun risultato trovato',
                };
            }
            setTimeout(() => {
                searching = false;
            }, 150);
        }
    }

    function focusSearch() {
        if (show) {
            setTimeout(() => {
                document.getElementById('assistant-search').focus();
            }, 100);
            // disable scroll of body
            document.body.style.overflow = 'hidden';
        } else {
            searchValue = '';
            searchResults = {
                users_match: [],
                sport_associations_match: [],
                message: '',
            };
            searching = false;
            document.body.style.overflow = 'auto';
        }
    }

    onMount(() => {
        // on esc key press close modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                show = false;
            }
        });
    });
</script>

<!-- svelte-ignore missing-declaration -->
{#if show}
    <Portal>
        <!-- Modal-->
        <div
            class="modal fade show"
            {id}
            tabindex="-1"
            role="dialog"
            aria-labelledby="staticBackdrop"
            aria-hidden="true"
            style="display:block; backdrop-filter: blur(3px) brightness(.8);-webkit-backdrop-filter: blur(3px) brightness(.8)">
            <div
                class="modal-dialog modal-dialog-centered"
                role="document"
                in:scale={{duration: 250, start: 0.98, easing: easing.cubicInOut}}>
                <div class="modal-content" style="overflow-y: auto;">
                    <div
                        class="modal-header d-flex justify-content-center align-items-center px-4 py-1"
                        style="border-bottom: 1px solid #ebedf3 !important;">
                        <MagnifyingGlass size="22" />
                        <input
                            id="assistant-search"
                            tabindex="0"
                            type="text"
                            on:keypress={e => {
                                if (e.key === 'Enter') {
                                    updateToolsAndSearch(true);
                                }
                            }}
                            bind:value={searchValue}
                            class="form-control border-0 font-weight-bold font-size-lg mx-2 my-2"
                            placeholder={"Cerca utenti..."} />
                        <button class="btn btn-sm btn-ghost m-0 p-0" on:click={() => (show = false)}>
                            <X size="22" />
                        </button>
                    </div>
                    <div class="modal-body m-0 p-0">
                        <div style="height:35rem; max-height: 35rem;overflow-y:auto" class="p-2 px-5">
                            {#if searching}
                                <div
                                    transition:scale={{duration: 200, start: 0.95, easing: easing.cubicInOut}}
                                    class="my-4 d-flex align-items-center justify-content-center p-2 rounded-lg">
                                    <div class="spinner spinner-primary spinner-lg mr-10" />
                                    <span class="font-weight-bold"
                                        >Ricerca in corso...</span>
                                </div>
                            {/if}
                            {#if searchResults?.users_match?.length > 0 || searchResults?.sport_associations_match?.length > 0 || searchResults?.message != ''}
                                <h6 class="font-weight-boldest my-3">Risultati ricerca</h6>
                                {#each Array.from(searchResults.users_match || []) as user}
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                    <div
                                        on:click={() => {
                                            push(`/search/profile/${user.username}`);
                                            setTimeout(() => {
                                                show = false;
                                                window.location.reload();
                                            }, 100);
                                        }}
                                        in:fly={{duration: 250, y: -10, easing: easing.cubicInOut}}
                                        class="command-search mb-2 cursor-pointer font-weight-boldest text-dark-75 d-flex align-items-center justify-content-between border p-2 rounded-lg">
                                        <div>
                                            {#if user.avatar_image}
                                                <img
                                                    alt={user.username}
                                                    src={user.avatar_image}
                                                    class="rounded-circle mr-4"
                                                    height="22"
                                                    width="22" />
                                            {:else}
                                                <User size="22" weight="duotone" class="mr-4 text-primary" />
                                            {/if}
                                            {user.first_name}
                                            {user.last_name}
                                        </div>
                                        <!-- label for associazioni sportive -->
                                        <span class="badge badge-secondary mr-0">Atleta</span>
                                    </div>
                                {/each}
                                {#each Array.from(searchResults.sport_associations_match || []) as sport_association}
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                    <div
                                        on:click={() => {
                                            push(`/search/profile/${sport_association?.user.username}`);
                                            setTimeout(() => {
                                                show = false;
                                                window.location.reload();
                                            }, 100);
                                        }}
                                        in:fly={{duration: 250, y: -10, easing: easing.cubicInOut}}
                                        class="command-search mb-2 cursor-pointer font-weight-boldest text-dark-75 d-flex align-items-center justify-content-between border p-2 rounded-lg">
                                        <div>
                                            {#if sport_association?.user?.avatar_image}
                                                <img
                                                    alt={sport_association?.user?.username}
                                                    src={sport_association?.user?.avatar_image}
                                                    class="rounded-circle mr-4"
                                                    height="22"
                                                    width="22" />
                                            {:else}
                                                <PersonSimple
                                                    size="22"
                                                    weight="duotone"
                                                    class="mr-4 text-primary" />
                                            {/if}
                                            {sport_association.denomination}
                                        </div>
                                        <!-- label for associazioni sportive -->
                                        <span class="badge badge-primary mr-0">Associazione sportiva</span>
                                    </div>
                                {/each}
                            {:else}
                                <div class="d-flex align-items-center justify-content-center p-2 rounded-lg">
                                    Nessun risultato trovato.
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Portal>
{/if}

<svelte:head>
    <style>
        input:focus {
            outline: none !important;
        }
        .command-search:hover {
            background-color: #f5f5f5;
        }
        /* Customizes the whole scrollbar */
        ::-webkit-scrollbar {
            background: transparent; /* color of the entire scrollbar except the thumb */
            width: 8px; /* width of the entire scrollbar */
        }

        /* Customizes the background of the scrollbar track */
        ::-webkit-scrollbar-track {
            background: #f5f5f5; /* color of the tracking area */
        }

        /* Customizes the scrollbar handle */
        ::-webkit-scrollbar-thumb {
            border-radius: 0.35rem; /* roundness of the scroll thumb */
            background: #e3e5ea; /* color of the scroll thumb */
        }

        /* Changes the color of the scrollbar thumb when hovering or clicking on it */
        ::-webkit-scrollbar-thumb:hover {
            background: #b7bcc5;
            transition: all 0.5s ease-in-out;
        }
    </style>
</svelte:head>
