<script>
    import {fade, scale, fly} from 'svelte/transition';
    export let selectedAccountType = 'signup_athlete';
</script>

<div in:scale={{duration: 100, start: 0.95}}>
    <!--begin::Title-->
    <div class="pb-13 pt-lg-0 pt-5 text-center">
        <h3 class="font-weight-bolder text-dark font-size-h4 font-size-h1-lg" style="font-size: 3.5rem !important">
            Iscriviti
        </h3>
        <p class="text-muted font-size-h4">Sei un <b>atleta</b> o un'<b>associazione Sportiva</b>?</p>
    </div>
    <div class="form-group m-0">
        <div class="row">
            <div class="col-6 col-lg-6" in:fly={{delay: 100, duration: 200, x: -20}}>
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label
                    class="option {selectedAccountType == 'signup_athlete' ? 'highlighted' : ''}"
                    style="border: 0px; background: #f9f9f9;cursor: pointer;">
                    <span class="option-control" style="display: none;">
                        <span class="radio radio-lg">
                            <!-- <input type="radio" name="payment_option" value="athlete" bind:group={$paymentMethod.type} checked={$paymentMethod.type == "cash"} /> -->
                            <input
                                type="radio"
                                name="account_type"
                                on:click={() => (selectedAccountType = 'signup_athlete')}
                                value="athlete"
                                aria-selected="true"
                                checked />
                            <span />
                        </span>
                    </span>
                    <span class="option-label">
                        <span class="option-head" style="margin-left: 1rem;">
                            <span
                                class="option-title"
                                style={window.innerWidth < 768 ? 'font-size: 1rem !important;height:2.5rem;' : ''}>
                                Atleta
                            </span>
                        </span>
                        <span class="option-body" style="text-align: center">
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <img
                                src="/static/assets/media/svg/illustrations/two-athletes-posing-in-action.svg"
                                style="max-width: 100%; max-height: 12rem;" />
                        </span>
                    </span>
                </label>
            </div>
            {#if __bakney.OEM_CONFIG?.displaySettings.login.showSportAssociationCreation}
            <div class="col-6 col-lg-6" in:fly={{delay: 100, duration: 200, x: 20}}>
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label
                    in:fade
                    class="option {selectedAccountType != 'signup_athlete' ? 'highlighted' : ''}"
                    style="border: 0px; background: #f9f9f9;cursor: pointer;">
                    <span class="option-control" style="display: none;">
                        <span class="radio radio-lg">
                            <input
                                type="radio"
                                on:click={() => (selectedAccountType = 'signup_association')}
                                name="account_type"
                                value="signup_athlete"
                                aria-selected="true" />
                            <span />
                        </span>
                    </span>
                    <span class="option-label" style="margin-left: 1rem;">
                        <span class="option-head">
                            <span
                                class="option-title"
                                style={window.innerWidth < 768 ? 'font-size: 1rem !important;height:2.5rem;' : ''}>
                                Associazione
                            </span>
                        </span>
                        <span class="option-body" style="text-align: center">
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <img
                                src="/static/assets/media/svg/illustrations/busy-project-manager-overwhelmed-by-work.svg"
                                style="max-width: 100%; max-height: 12rem;" />
                        </span>
                    </span>
                </label>
                </div>
            {/if}
        </div>
    </div>
</div>

<svelte:head>
    <style>
        .option-title {
            color: #0340a3 !important;
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            padding-bottom: 0.5rem;
        }
    </style>
</svelte:head>

<style>
    .highlighted {
        background-color: #e1f0ff !important;
        outline: 0.24rem solid #9ab1d7;
        transition: all 0.1s;
    }
</style>
