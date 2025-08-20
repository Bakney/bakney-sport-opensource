<script>
    import {apiFetch, replaceUID} from 'utils/ApiMiddleware.js';
    import {UserCircle, Printer} from 'phosphor-svelte';
    import {userData} from 'store/stores';
    import {onMount} from 'svelte';
    import QrCode from 'svelte-qrcode';
    import {toast} from 'svelte-sonner';
    userData.useLocalStorage();

    export let params = {};
    export let member;

    let shareToken = null;

    function printCard() {
        // Show confirmation alert before printing
        swal.fire({
            title: 'Stampare la tessera?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Stampa',
            cancelButtonText: 'Annulla',
            reverseButtons: true,
        }).then(result => {
            if (result.isConfirmed) {
                window.print();
            }
        });
    }

    async function getMember() {
        const res = await apiFetch(
            replaceUID(__bakney.env.API.SUBSCRIPTION.CARD, params.subscriptionId) + `?token=${params.token || ''}`
        );
        if (res.response && res.response.member && !res.error) {
            member = res.response.member;
            if (params.print) {
                setTimeout(() => {
                    window.print();
                }, 1000);
            }
        } else {
            member = null;
            toast.error(res.response.msg ?? 'Tessera non trovata');
        }
    }

    async function shareCard(skipSwal = false) {
        const res = await apiFetch(replaceUID(__bakney.env.API.SUBSCRIPTION.CARD, member.subscription_id), {
            method: 'POST',
        });

        if (res.response && res.response.token && !res.error) {
            // create modal with the share link
            shareToken = res.response.token;

            const shareLink = `${window.location.origin}/#/card/${member.subscription_id}/${shareToken}`;

            if (!skipSwal) {
                const copyToClipboard = () => {
                    const copyText = document.getElementById('shareLink');
                    copyText?.select();
                    copyText?.setSelectionRange(0, 99999);
                    navigator.clipboard
                        .writeText(copyText.value)
                        .then(() => toast.success('Link copiato negli appunti'))
                        .catch(err => toast.error('Errore nella copia del link'));
                };

                const createEmailLink = () => {
                    const email = member.associate.email || member.associate.tutor?.email || '';
                    const subject = encodeURIComponent(`Ecco la tua tessera ${member.associate.first_name}`);
                    const body = encodeURIComponent(
                        `Ciao ${member.associate.first_name},\n` +
                            `Ecco la tua tessera: \n\n${shareLink}\n\n Hai 3 giorni per scaricarla.\n\n` +
                            `Cordialmente,\n${$userData?.sport_association?.denomination || ''}`
                    );
                    return `mailto:${email}?subject=${subject}&body=${body}`;
                };

                const createWhatsAppLink = () => {
                    const text = encodeURIComponent(
                        `Ciao ${member.associate.first_name},\n` +
                            `Ecco la tua tessera: \n\n${shareLink}\n\n` +
                            `Hai 3 giorni per scaricarla.\n\n` +
                            `Cordialmente,\n${$userData?.sport_association?.denomination || ''}`
                    );
                    return `https://wa.me/?text=${text}`;
                };

                swal.fire({
                    title: 'Link valido per 3 giorni',
                    html: `
                <p>Copia e condividi il link seguente:</p>
                <div class="input-group mb-3 d-flex align-items-center">
                    <input type="text" class="form-control" value="${shareLink}" id="shareLink" readonly style="border-radius: .75rem 0 0 .75rem !important;">
                    <div class="input-group-append">
                        <button class="btn btn-primary m-0 font-weight-boldest rounded-lg rounded-left-0" type="button" id="copyButton">
                            Copia
                        </button>
                    </div>
                    <button 
                        class="btn btn-primary mt-6 mx-0 font-weight-boldest w-100" 
                        type="button" 
                        id="emailButton">
                        Invia per email
                    </button>
                    <button 
                        class="btn btn-success mt-4 mx-0 font-weight-boldest w-100" 
                        type="button" 
                        id="whatsappButton">
                        Condividi su WhatsApp
                    </button>
                </div>
            `,
                    icon: 'success',
                    showConfirmButton: false,
                    didOpen: () => {
                        // Setup click handlers after modal is opened
                        document.getElementById('copyButton')?.addEventListener('click', copyToClipboard);
                        document.getElementById('emailButton')?.addEventListener('click', () => {
                            window.location.href = createEmailLink();
                        });
                        document.getElementById('whatsappButton')?.addEventListener('click', () => {
                            window.open(createWhatsAppLink(), '_blank');
                        });
                    },
                    willClose: () => {
                        // Cleanup event listeners when modal closes
                        document.getElementById('copyButton')?.removeEventListener('click', copyToClipboard);
                        document.getElementById('emailButton')?.removeEventListener('click', () => {
                            window.location.href = createEmailLink();
                        });
                        document.getElementById('whatsappButton')?.removeEventListener('click', () => {
                            window.open(createWhatsAppLink(), '_blank');
                        });
                    },
                });
            }
        } else {
            toast.error(res.response.msg ?? 'Errore nella condivisione della tessera');
        }
    }

    async function shareCardAndOpenPrintInAnotherTab() {
        await shareCard(true);
        window.open(`${window.location.origin}/#/card/${member.subscription_id}/${shareToken}/print`, '_blank');
    }

    onMount(() => {
        if (params?.subscriptionId) {
            // alert(params.subscriptionId);
            getMember();
        }
    });
</script>

{#if member}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="d-flex flex-column align-items-center {params?.token ? 'h-100' : ''}">
        <div
            class="d-flex justify-content-start align-items-center"
            style="cursor: pointer;{params?.token ? 'margin:auto;' : ''}">
            <div id="front-card" style="font-size: 10px;">
                <!-- <h2 class="text-center text-dark font-weight-boldest">Fronte</h2> -->
                <div
                    id="card-to-print"
                    class="border rounded-xl d-flex justify-content-between shadow-xs flex-column"
                    style="width: 86mm; height: 54mm; min-height: 54mm; min-width: 86mm; overflow: hidden;">
                    <div class="d-flex bg-primary rounded-sm p-2" style="min-height: 35mm; max-height: 35mm;">
                        <div
                            class="p-1 m-1 my-2 mb-0 bg-white border rounded-lg d-flex justify-content-center align-items-center cursor-pointer"
                            on:click={() => {
                                const qrCode = document.createElement('div');
                                qrCode.style.position = 'fixed';
                                qrCode.style.top = '0';
                                qrCode.style.left = '0';
                                qrCode.style.width = '100vw';
                                qrCode.style.height = '100vh';
                                qrCode.style.backgroundColor = 'rgba(0,0,0,0.8)';
                                qrCode.style.backdropFilter = 'blur(10px)';
                                qrCode.style.display = 'flex';
                                qrCode.style.justifyContent = 'center';
                                qrCode.style.alignItems = 'center';
                                qrCode.style.zIndex = '9999';

                                const qrContainer = document.createElement('div');
                                qrContainer.style.background = 'white';
                                qrContainer.style.padding = '20px';
                                qrContainer.style.borderRadius = '10px';
                                qrContainer.style.position = 'relative';

                                const closeButton = document.createElement('button');
                                closeButton.textContent = 'X';
                                closeButton.style.position = 'fixed';
                                closeButton.style.top = '20px';
                                closeButton.style.right = '20px';
                                closeButton.style.background = 'none';
                                closeButton.style.border = 'none';
                                closeButton.style.fontSize = '24px';
                                closeButton.style.fontWeight = 'bold';
                                closeButton.style.color = 'white';
                                closeButton.style.cursor = 'pointer';
                                closeButton.onclick = e => {
                                    e.stopPropagation();
                                    document.body.removeChild(qrCode);
                                };
                                qrCode.appendChild(closeButton);

                                const size = Math.min(window.innerWidth * 0.8, 300);

                                import('svelte-qrcode').then(module => {
                                    new module.default({
                                        target: qrContainer,
                                        props: {
                                            value: member.subscription_id || params.subscriptionId,
                                            size: size,
                                        },
                                    });
                                });

                                qrCode.appendChild(qrContainer);
                                qrCode.onclick = () => document.body.removeChild(qrCode);

                                document.body.appendChild(qrCode);

                                // Add full name above QR code
                                const nameElement = document.createElement('p');
                                nameElement.textContent = `${member.associate.first_name} ${member.associate.last_name}`;
                                nameElement.style.textAlign = 'center';
                                nameElement.style.fontSize = '15px';
                                nameElement.style.fontWeight = 'bold';
                                qrContainer.appendChild(nameElement);
                            }}>
                            <QrCode value={member.subscription_id || params.subscriptionId} size={87} />
                        </div>
                        <div
                            class="d-flex flex-column justify-content-start w-100 ml-2 mx-2 pt-1 pt-md-2"
                            style="overflow: hidden;">
                            <h5 class="text-left font-weight-boldest text-white mb-2" style="font-size: 11px;">
                                {member.associate.first_name}
                                {member.associate.last_name}
                            </h5>
                            <div class="text-left text-white mb-1 d-flex align-items-center" style="font-size: 9px;">
                                <div class="font-weight-boldest text-size-sm col-4 p-0">TESSERA</div>
                                <div
                                    class="ml-2 w-100 text-uppercase col-8 bg-white py-1 px-2 text-dark font-weight-boldest text-size-sm">
                                    {member.subscription_number || 'n/d'}
                                </div>
                            </div>
                            <div class="text-left text-white mb-1 d-flex align-items-center" style="font-size: 9px;">
                                <div class="font-weight-boldest col-4 p-0">TIPOLOGIA</div>
                                <div
                                    class="ml-2 w-100 text-uppercase col-8 bg-white py-1 px-2 text-dark font-weight-boldest text-size-sm">
                                    {member.subscription_type || 'n/d'}
                                </div>
                            </div>
                            <div class="text-left text-white my-0 d-flex align-items-center" style="font-size: 9px;">
                                <div class="font-weight-boldest col-4 p-0">SCADE IL</div>
                                <div
                                    class="ml-2 w-100 text-uppercase col-8 bg-white py-1 px-2 text-dark font-weight-boldest text-size-sm">
                                    {new Date(member.end_date || member.subscription_end_date).toLocaleDateString(
                                        'it-IT'
                                    ) || 'n/d'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center px-4" style="height: 30mm;">
                        <div class="d-flex justify-content-center align-items-start flex-column">
                            {#if $userData?.sport_association?.logo || member?.sport_association?.user?.avatar_image}
                                <img
                                    src={$userData?.sport_association?.logo ||
                                        member?.sport_association?.user?.avatar_image ||
                                        'https://via.placeholder.com/50'}
                                    alt="Avatar"
                                    height="35" />
                                <h6 class="font-weight-boldest font-size-sm mt-2">
                                    {member?.sport_association?.denomination ||
                                        $userData?.sport_association?.denomination ||
                                        ''}
                                </h6>
                            {:else}
                                <h6 class="font-weight-boldest">
                                    {member?.sport_association?.denomination ||
                                        $userData?.sport_association?.denomination ||
                                        ''}
                                </h6>
                            {/if}
                        </div>
                        {#if member.associate.avatar}
                            <img
                                src={member.associate.avatar || 'https://via.placeholder.com/50'}
                                alt="Avatar"
                                height="50" />
                        {:else}
                            <UserCircle size={50} weight="duotone" class="text-dark" />
                        {/if}
                    </div>
                </div>
            </div>
            {#if params?.token}
                <button
                    type="button"
                    class="btn btn-dark font-weight-boldest d-flex align-items-center btn-sm py-1 px-2 ml-12 d-print-none"
                    on:click|preventDefault={printCard}>
                    <Printer size={16} weight="fill" class="mr-1" />
                    Stampa tessera</button>
            {/if}

            <!-- <div class="d-flex justify-content-center align-items-center">
        <button
            class="btn btn-primary"
            on:click={() => {
                // chrome api to print the div front-card
                window.print();
            }}>
            Stampa Tessera
        </button>
    </div> -->

            <!-- <div class="mr-12">
        <h2 class="text-center text-dark font-weight-boldest">Retro</h2>
        <div
            class="border rounded-xl d-flex justify-content-between shadow-xs flex-column"
            style="width: 86mm; height: 54mm;border-bottom: 4px solid #d5d7dd !important; border-right: 2px solid #d5d7dd !important;overflow: hidden;">
            <div class="d-flex justify-content-between align-items-center h-100">
                <div class="bg-dark w-100" style="height:3rem" />
            </div>
        </div>
    </div> -->
        </div>
        <div class="d-flex justify-content-center align-items-center w-100 mt-6">
            {#if !params?.token}
                <button
                    type="button"
                    class="btn btn-outline-secondary font-weight-boldest d-flex align-items-center btn-sm py-1 px-2"
                    on:click={() => shareCard(false)}>
                    Condividi tessera
                </button>
                <button
                    type="button"
                    class="btn btn-outline-secondary font-weight-boldest d-flex align-items-center btn-sm py-1 px-2 ml-2"
                    on:click={shareCardAndOpenPrintInAnotherTab}>
                    Stampa
                </button>
            {/if}
        </div>
    </div>
{:else}
    <div class="d-flex justify-content-center align-items-center w-100 mt-6">
        <h2 class="text-center text-dark font-weight-boldest">Tessera non trovata</h2>
    </div>
{/if}

<svelte:head>
    <style>
        @media print {
            #card-to-print {
                box-shadow: none !important;
            }
        }
    </style>
</svelte:head>
