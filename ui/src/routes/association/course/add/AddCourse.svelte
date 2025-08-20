<script>
    import {newCourse, sessionToken} from 'store/stores.js';
    import Section1 from './sections/Section1.svelte';
    import {toast} from 'svelte-sonner';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    sessionToken.useLocalStorage();
    newCourse.useLocalStorage();

    newCourse.set({
        title: '',
        description: '',
        fee: 0,
        course_type: 1,
        billed_duration_is_sport_season: false,
        auto_renewal: true,
        billed_from_subscription_date: true,
        billed_frequency: 1,
        billed_from_day_of_month: 1,
        multiple_quotes: null,
        locations: [],
    });

    function validateForm() {
        if (!$newCourse.title) {
            toast.warning('Inserisci il titolo del corso');
            return false;
        }

        if (!$newCourse.description) {
            toast.warning('Inserisci la descrizione del corso');
            return false;
        }

        if (
            ($newCourse.course_type === 1 || $newCourse.course_type === 3) &&
            (!$newCourse.fee || $newCourse.fee <= 0)
        ) {
            toast.warning(
                $newCourse.course_type === 3
                    ? "Inserisci una quota valida per l'abbonamento"
                    : 'Inserisci una quota valida'
            );
            return false;
        }

        return true;
    }

    async function createCourse() {
        if (!validateForm()) return;

        if (typeof $newCourse.fee === 'string') {
            $newCourse.fee = parseFloat($newCourse.fee.replace(',', '.'));
        }

        KTApp.blockPage({
            overlayColor: '#000000',
            state: 'primary',
            message: 'Inserimento in corso...',
        });

        const url = __bakney.env.HOST + '/course/add';

        if ($newCourse.course_type === 2 || $newCourse.course_type === 3) {
            delete $newCourse.events;
            delete $newCourse.multi_payments_split;
        }

        const res = await window.fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + $sessionToken,
            },
            body: JSON.stringify({
                new_course: $newCourse,
                subscriptions: [],
            }),
        });

        const response = await res.json();
        KTApp.unblockPage();

        if (res.status == 200) {
            dispatch('close');
            toast.success('Nuovo corso creato con successo.');
        } else if (res.status == 400) {
            toast.warning('Alcuni dati inseriti non sono validi, ricontrollali.');
        } else {
            toast.error('Scusa, ho individuato degli errori, riprova.');
        }
    }

    // Execute a function when the user releases a key on the keyboard
    window.addEventListener('keyup', function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (event.key) {
            case 'Enter':
                if (document.activeElement.classList.contains('ql-editor')) break;
                let confirm = document.getElementsByClassName('swal2-confirm');
                if (confirm.length > 0) {
                    confirm[0].click();
                    break;
                }
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }
    });
</script>

<div class="row px-8 px-md-0 mx-0 mx-8">
    <form class="form" id="kt_form">
        <Section1 />
        <div class="d-flex justify-content-end border-top pt-10">
            <div>
                <button type="button" class="btn btn-primary font-weight-boldest" on:click={createCourse}>
                    Salva
                </button>
            </div>
        </div>
    </form>
</div>
