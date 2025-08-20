<script>
    import {Checks, X} from 'phosphor-svelte';

    export let currentCollaboratorPermissions = [];

    // BASIC PERMISSIONS: Create, Read, Update, Delete
    let collaboratorPermissions = [
        // dashboard
        'association.dashboard.read',

        // ticketing
        'association.ticketing.create',

        // calendar
        'association.calendar.read',

        // personas
        'association.personas.read',
        'association.personas.create',
        'association.personas.update',
        'association.personas.delete',

        // templates
        'association.templates.read',
        'association.templates.create',
        'association.templates.update',
        'association.templates.delete',

        // members
        'association.members.read',
        'association.members.create',
        'association.members.update',
        'association.members.delete',

        // members archive
        'association.members.archive.read',
        'association.members.archive.update',

        // modules
        'association.modules.read',
        'association.modules.create',
        'association.modules.update',
        'association.modules.delete',

        // courses
        'association.courses.read',
        'association.courses.create',
        'association.courses.update',
        'association.courses.delete',

        // camps and retreats
        'association.campsandretreats.read',
        'association.campsandretreats.create',
        'association.campsandretreats.update',
        'association.campsandretreats.delete',

        // courses archive
        // 'association.courses.archive.read',
        // 'association.courses.archive.update',

        // carnet
        'association.carnet.read',
        'association.carnet.create',
        'association.carnet.update',
        'association.carnet.delete',

        // instructor
        'association.instructor.read',
        'association.instructor.create',
        'association.instructor.update',
        'association.instructor.delete',

        // instructor hours
        'association.instructor.hours.read',
        'association.instructor.hours.create',
        'association.instructor.hours.update',
        'association.instructor.hours.delete',

        // attendance
        'association.courses.attendance.read',
        'association.courses.attendance.update',

        // archive
        'association.archive.read',
        'association.archive.update',

        // report
        'association.report.read',

        // events
        'association.events.read',
        'association.events.create',
        'association.events.update',
        'association.events.delete',

        // events archive
        // 'association.events.archive.read',
        // 'association.events.archive.update',

        // communication
        'association.communication.messages.read',
        'association.communication.messages.create',
        'association.communication.messages.update',
        'association.communication.messages.delete',

        // communication workflows
        'association.communication.workflows.read',
        'association.communication.workflows.create',
        'association.communication.workflows.update',
        'association.communication.workflows.delete',

        // communication settings
        'association.communication.settings.read',
        'association.communication.settings.update',

        // payments
        'bookeeping.payments.read',
        'bookeeping.payments.create',
        'bookeeping.payments.update',
        'bookeeping.payments.delete',

        // payments archive
        'bookeeping.payments.archive.read',
        'bookeeping.payments.archive.update',

        // invoices
        'bookeeping.documents.invoices.read',
        'bookeeping.documents.invoices.create',
        'bookeeping.documents.invoices.update',
        'bookeeping.documents.invoices.delete',

        // invoice archive
        'bookeeping.documents.invoices.archive.read',
        'bookeeping.documents.invoices.archive.update',

        // client invoices
        'bookeeping.documents.clientinvoices.read',
        'bookeeping.documents.clientinvoices.create',
        'bookeeping.documents.clientinvoices.update',
        'bookeeping.documents.clientinvoices.delete',

        // supplier invoices
        'bookeeping.documents.supplierinvoices.read',
        'bookeeping.documents.supplierinvoices.create',
        'bookeeping.documents.supplierinvoices.update',
        'bookeeping.documents.supplierinvoices.delete',

        // suppliers
        'bookeeping.management.suppliers.read',
        'bookeeping.management.suppliers.create',
        'bookeeping.management.suppliers.update',
        'bookeeping.management.suppliers.delete',

        // accounts
        'bookeeping.management.accounts.read',
        'bookeeping.management.accounts.create',
        'bookeeping.management.accounts.update',
        'bookeeping.management.accounts.delete',

        // accounts transfers
        'bookeeping.management.accountstransfers.read',
        'bookeeping.management.accountstransfers.create',
        'bookeeping.management.accountstransfers.update',
        'bookeeping.management.accountstransfers.delete',

        // balance sheet
        'bookeeping.management.balancesheet.read',
        'bookeeping.management.balancesheet.update',

        // collaborators
        'other.users.collaborators.read',
        'other.users.collaborators.create',
        'other.users.collaborators.update',
        'other.users.collaborators.delete',

        // connected athletes
        'other.users.connectedathletes.read',
        'other.users.connectedathletes.delete',

        // settings
        'other.settings.read',
        'other.settings.update',

        // notifications
        'other.notifications.read',
    ];

    let collaboratorPermissionsMap = {
        // Dashboard
        'association.dashboard.read': 'Vedi dashboard',
        'association.ticketing.create': 'Crea ticket di supporto',
        'association.calendar.read': 'Vedi calendario generale',

        // Personas
        'association.personas.read': 'Vedi anagrafiche',
        'association.personas.create': "Crea un'anagrafica",
        'association.personas.update': "Aggiorna un'anagrafica",
        'association.personas.delete': "Elimina un'anagrafica",

        // templates
        'association.templates.read': 'Vedi modelli documenti',
        'association.templates.create': 'Crea un modello documento',
        'association.templates.update': 'Aggiorna un modello documento',
        'association.templates.delete': 'Elimina un modello documento',

        // Members
        'association.members.read': 'Vedi le iscrizioni',
        'association.members.create': "Crea un'iscrizione",
        'association.members.update': "Aggiorna un'iscrizione",
        'association.members.delete': "Elimina un'iscrizione",

        // Members Archive
        'association.members.archive.read': "Vedi l'archivio delle iscrizioni",
        'association.members.archive.update': "Aggiorna l'archivio delle iscrizioni",

        // modules
        'association.modules.read': 'Vedi i moduli',
        'association.modules.create': 'Crea un modulo',
        'association.modules.update': 'Aggiorna un modulo e risposte',
        'association.modules.delete': 'Elimina un modulo e risposte',

        // Courses
        'association.courses.read': 'Vedi i corsi',
        'association.courses.create': 'Crea un corso',
        'association.courses.update': 'Aggiorna un corso',
        'association.courses.delete': 'Elimina un corso',

        // Camps and Retreats
        'association.campsandretreats.read': 'Vedi i campeggi e ritiri',
        'association.campsandretreats.create': 'Crea un campeggio o ritiro',
        'association.campsandretreats.update': 'Aggiorna un campeggio o ritiro',
        'association.campsandretreats.delete': 'Elimina un campeggio o ritiro',

        // Carnet
        'association.carnet.read': 'Vedi i carnet',
        'association.carnet.create': 'Crea un carnet',
        'association.carnet.update': 'Aggiorna un carnet',
        'association.carnet.delete': 'Elimina un carnet',

        // Instructor
        'association.instructor.read': 'Vedi gli istruttori',
        'association.instructor.create': 'Crea un istruttore',
        'association.instructor.update': 'Aggiorna un istruttore',
        'association.instructor.delete': 'Elimina un istruttore',

        // Instructor hours
        'association.instructor.hours.read': 'Vedi orari istruttori',
        'association.instructor.hours.create': 'Crea orari istruttore',
        'association.instructor.hours.update': 'Aggiorna orari istruttore',
        'association.instructor.hours.delete': 'Elimina orari istruttore',

        // Attendance
        'association.courses.attendance.read': 'Vedi le presenze ai corsi',
        'association.courses.attendance.update': 'Aggiorna le presenze ai corsi',

        // Archive
        'association.archive.read': "Vedi l'archivio",
        'association.archive.update': "Aggiorna l'archivio",

        // Report
        'association.report.read': 'Vedi report statistiche',

        // Events
        'association.events.read': 'Vedi gli eventi',
        'association.events.create': 'Crea un evento',
        'association.events.update': 'Aggiorna un evento',
        'association.events.delete': 'Elimina un evento',

        // Communication
        'association.communication.messages.read': 'Vedi i messaggi',
        'association.communication.messages.create': 'Crea un messaggio',
        'association.communication.messages.update': 'Aggiorna un messaggio',
        'association.communication.messages.delete': 'Elimina un messaggio',

        'association.communication.workflows.read': 'Vedi le automazioni',
        'association.communication.workflows.create': "Crea un'automazione",
        'association.communication.workflows.update': "Aggiorna un'automazione",
        'association.communication.workflows.delete': "Elimina un'automazione",

        'association.communication.settings.read': 'Vedi le impostazioni',
        'association.communication.settings.update': 'Aggiorna le impostazioni',

        // Payments
        'bookeeping.payments.read': 'Vedi i pagamenti',
        'bookeeping.payments.create': 'Crea un pagamento',
        'bookeeping.payments.update': 'Aggiorna un pagamento',
        'bookeeping.payments.delete': 'Elimina un pagamento',

        // Payments Archive
        'bookeeping.payments.archive.read': "Vedi l'archivio dei pagamenti",
        'bookeeping.payments.archive.update': "Aggiorna l'archivio dei pagamenti",

        // Invoices
        'bookeeping.documents.invoices.read': 'Vedi le ricevute',
        'bookeeping.documents.invoices.create': 'Crea una ricevuta',
        'bookeeping.documents.invoices.update': 'Aggiorna una ricevuta',
        'bookeeping.documents.invoices.delete': 'Elimina una ricevuta',

        // Invoices Archive
        'bookeeping.documents.invoices.archive.read': "Vedi l'archivio delle ricevute",
        'bookeeping.documents.invoices.archive.update': "Aggiorna l'archivio delle ricevute",

        'bookeeping.documents.clientinvoices.read': 'Vedi le fatture clienti',
        'bookeeping.documents.clientinvoices.create': 'Crea una fattura cliente',
        'bookeeping.documents.clientinvoices.update': 'Aggiorna una fattura cliente',
        'bookeeping.documents.clientinvoices.delete': 'Elimina una fattura cliente',

        'bookeeping.documents.supplierinvoices.read': 'Vedi le fatture fornitori',
        'bookeeping.documents.supplierinvoices.create': 'Crea una fattura fornitore',
        'bookeeping.documents.supplierinvoices.update': 'Aggiorna una fattura fornitore',
        'bookeeping.documents.supplierinvoices.delete': 'Elimina una fattura fornitore',

        'bookeeping.management.suppliers.read': 'Vedi i fornitori',
        'bookeeping.management.suppliers.create': 'Crea un fornitore',
        'bookeeping.management.suppliers.update': 'Aggiorna un fornitore',
        'bookeeping.management.suppliers.delete': 'Elimina un fornitore',

        'bookeeping.management.accounts.read': 'Vedi i conti',
        'bookeeping.management.accounts.create': 'Crea un conto',
        'bookeeping.management.accounts.update': 'Aggiorna un conto',
        'bookeeping.management.accounts.delete': 'Elimina un conto',

        'bookeeping.management.accountstransfers.read': 'Vedi i giroconti',
        'bookeeping.management.accountstransfers.create': 'Crea un giroconto',
        'bookeeping.management.accountstransfers.update': 'Aggiorna un giroconto',
        'bookeeping.management.accountstransfers.delete': 'Elimina un giroconto',

        'bookeeping.management.balancesheet.read': 'Vedi il bilancio',
        'bookeeping.management.balancesheet.update': 'Aggiorna il bilancio',

        // Collaborators
        'other.users.collaborators.read': 'Vedi i collaboratori',
        'other.users.collaborators.create': 'Crea un collaboratore',
        'other.users.collaborators.update': 'Aggiorna un collaboratore',
        'other.users.collaborators.delete': 'Elimina un collaboratore',

        // Connected Athletes
        'other.users.connectedathletes.read': 'Vedi gli atleti connessi',
        'other.users.connectedathletes.delete': 'Elimina un atleta connesso',

        // Settings
        'other.settings.read': 'Vedi le impostazioni',
        'other.settings.update': 'Aggiorna le impostazioni',

        // Notifications
        'other.notifications.read': 'Vedi le notifiche',
    };

    // order is changed for the view
    let resources = [
        'association.dashboard',
        'association.ticketing',
        'association.calendar',
        'association.report',
        'association.archive',
        'association.communication.settings',
        'association.courses.attendance',
        'bookeeping.management.balancesheet',
        'other.users.connectedathletes',
        'other.settings',
        'association.members.archive',
        'bookeeping.payments.archive',
        'bookeeping.documents.invoices.archive',
        'association.personas',
        'association.templates',
        'association.members',
        'association.modules',
        'association.courses',
        'association.campsandretreats',
        'association.carnet',
        'association.instructor',
        'association.instructor.hours',
        'association.events',
        'association.communication.messages',
        'association.communication.workflows',
        'bookeeping.payments',
        'bookeeping.documents.invoices',
        'bookeeping.documents.clientinvoices',
        'bookeeping.documents.supplierinvoices',
        'bookeeping.management.suppliers',
        'bookeeping.management.accounts',
        'bookeeping.management.accountstransfers',
        'other.users.collaborators',
        'other.notifications',
    ];

    let resourcesMap = {
        'association.dashboard': 'Dashboard',
        'association.ticketing': 'Ticketing',
        'association.calendar': 'Calendario',
        'association.members': 'Iscrizioni',
        'association.modules': 'Moduli',
        'association.personas': 'Anagrafiche',
        'association.templates': 'Modelli Documenti',
        'association.members.archive': 'Archivio Iscrizioni',
        'association.courses': 'Corsi',
        'association.campsandretreats': 'Campi e Ritiri',
        'association.carnet': 'Carnet',
        'association.instructor': 'Istruttori',
        'association.instructor.hours': 'Orario istruttori',
        'association.courses.attendance': 'Presenze ai corsi',
        'association.archive': 'Archivio Documenti',
        'association.report': 'Report',
        'association.events': 'Eventi',
        'association.communication.messages': 'Comunicazioni',
        'association.communication.workflows': 'Automazioni',
        'association.communication.settings': 'Impostazioni comunicazioni',
        'bookeeping.payments.archive': 'Archivio Pagamenti',
        'bookeeping.payments': 'Pagamenti',
        'bookeeping.documents.invoices.archive': 'Archivio Ricevute',
        'bookeeping.documents.invoices': 'Ricevute',
        'bookeeping.documents.clientinvoices': 'Fatture clienti',
        'bookeeping.documents.supplierinvoices': 'Fatture fornitori',
        'bookeeping.management.suppliers': 'Fornitori',
        'bookeeping.management.accounts': 'Conti',
        'bookeeping.management.accountstransfers': 'Giroconti',
        'bookeeping.management.balancesheet': 'Bilancio',
        'other.users.collaborators': 'Collaboratori',
        'other.users.connectedathletes': 'Atleti connessi',
        'other.settings': 'Impostazioni',
        'other.notifications': 'Notifiche',
    };

    function updatePermissions(permissions) {
        if (!currentCollaboratorPermissions) currentCollaboratorPermissions = [];
        // if permission is already in the list, remove it from the list
        if (currentCollaboratorPermissions.includes(permissions)) {
            currentCollaboratorPermissions = currentCollaboratorPermissions.filter(
                permission => permission !== permissions
            );
        } else {
            currentCollaboratorPermissions = [...currentCollaboratorPermissions, permissions];
        }
    }

    function assignAllPermissions() {
        currentCollaboratorPermissions = [...collaboratorPermissions];
    }

    function removeAllPermissions() {
        currentCollaboratorPermissions = [];
    }

    function assignAllSubPermissions(subpath) {
        let subPermissions = collaboratorPermissions.filter(permission => checkIfIncludedResource(subpath, permission));
        currentCollaboratorPermissions = [...currentCollaboratorPermissions, ...subPermissions];
    }

    function removeAllSubPermissions(subpath) {
        let subPermissions = collaboratorPermissions.filter(permission => checkIfIncludedResource(subpath, permission));
        currentCollaboratorPermissions = currentCollaboratorPermissions.filter(
            permission => !subPermissions.includes(permission)
        );
    }

    function checkIfIncludedResource(resource, permission) {
        // endsWith is the tail of the permission
        let endsWith = permission.split('.').pop();
        // remove endsWith from permission
        let permissionWithoutEndsWith = permission.replace(`.${endsWith}`, '');

        return permissionWithoutEndsWith === resource;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-missing-attribute -->
<div class="d-flex justify-content-start mb-6 mt-3">
    <!-- remove all permissions -->
    <a class="font-weight-bold btn btn-light-primary btn-sm mr-2" on:click={removeAllPermissions}>Rimuovi tutto</a>
    <!-- assign all permissions -->
    <a class="font-weight-bold btn btn-primary btn-sm" on:click={assignAllPermissions}>Seleziona tutto</a>
</div>
<div class="row mt-2">
    {#each resources as resource}
        <div class="col-12 col-md-6">
            <div class="form-group border p-4 rounded-lg">
                <div class="d-flex justify-content-between">
                    <h6 class="font-weight-bolder text-primary">{resourcesMap[resource]}</h6>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <div class="d-flex justify-content-end">
                        <!-- remove all subpermissions -->
                        <a
                            class="font-weight-bold btn btn-light btn-icon btn-xs p-0 mr-2"
                            on:click={() => removeAllSubPermissions(resource)}>
                            <X size="14" weight="bold" />
                        </a>
                        <!-- assign all subpermissions -->
                        <a
                            class="font-weight-bold btn btn-light-primary btn-icon btn-xs p-0"
                            on:click={() => assignAllSubPermissions(resource)}>
                            <Checks size="14" weight="bold" />
                        </a>
                    </div>
                </div>
                <div class="checkbox-list mt-2">
                    {#each collaboratorPermissions as permission}
                        {#if checkIfIncludedResource(resource, permission)}
                            <label class="checkbox checkbox-rounded font-weight-bold" style="font-size:1rem;">
                                <input
                                    type="checkbox"
                                    checked={currentCollaboratorPermissions?.includes(permission)}
                                    name={permission}
                                    on:click={() => updatePermissions(permission)} />
                                <span />
                                {collaboratorPermissionsMap[permission]}
                            </label>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    {/each}
</div>
