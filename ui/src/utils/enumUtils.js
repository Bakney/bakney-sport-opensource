export const MembersListType = {
    ASSOCIATE_ONLY: 1,
    ASSOCIATE_AND_MEMBER: 2,
    MEMBER_ONLY: 3,
};

export const MembersListTypeLabel = {
    [MembersListType.ASSOCIATE_ONLY]: 'Socio',
    [MembersListType.ASSOCIATE_AND_MEMBER]: 'Socio e Tesserato',
    [MembersListType.MEMBER_ONLY]: 'Tesserato',
};

export const MembersListTypeOptions = [
    {value: MembersListType.ASSOCIATE_ONLY, label: MembersListTypeLabel[MembersListType.ASSOCIATE_ONLY]},
    {value: MembersListType.ASSOCIATE_AND_MEMBER, label: MembersListTypeLabel[MembersListType.ASSOCIATE_AND_MEMBER]},
    {value: MembersListType.MEMBER_ONLY, label: MembersListTypeLabel[MembersListType.MEMBER_ONLY]},
];

export const AssociateRole = {
    SOCIO_ORDINARIO: 1,
    CONSIGLIERE: 2,
    SEGRETARIO: 3,
    VICE_PRESIDENTE: 4,
    PRESIDENTE: 5,
    SOCIO_VOLONTARIO: 6,
    SOCIO_SOSTENITORE: 7,
    SOCIO_TESORIERE: 8,
};

export const AssociateRoleLabel = {
    [AssociateRole.SOCIO_ORDINARIO]: 'Socio ordinario',
    [AssociateRole.CONSIGLIERE]: 'Consigliere',
    [AssociateRole.SEGRETARIO]: 'Segretario',
    [AssociateRole.VICE_PRESIDENTE]: 'Vice Presidente',
    [AssociateRole.PRESIDENTE]: 'Presidente',
    [AssociateRole.SOCIO_VOLONTARIO]: 'Socio volontario',
    [AssociateRole.SOCIO_SOSTENITORE]: 'Socio sostenitore',
    [AssociateRole.SOCIO_TESORIERE]: 'Tesoriere',
};

export const AssociateRoleOptions = [
    {value: AssociateRole.SOCIO_ORDINARIO, label: AssociateRoleLabel[AssociateRole.SOCIO_ORDINARIO]},
    {value: AssociateRole.CONSIGLIERE, label: AssociateRoleLabel[AssociateRole.CONSIGLIERE]},
    {value: AssociateRole.SEGRETARIO, label: AssociateRoleLabel[AssociateRole.SEGRETARIO]},
    {value: AssociateRole.VICE_PRESIDENTE, label: AssociateRoleLabel[AssociateRole.VICE_PRESIDENTE]},
    {value: AssociateRole.PRESIDENTE, label: AssociateRoleLabel[AssociateRole.PRESIDENTE]},
    {value: AssociateRole.SOCIO_VOLONTARIO, label: AssociateRoleLabel[AssociateRole.SOCIO_VOLONTARIO]},
    {value: AssociateRole.SOCIO_SOSTENITORE, label: AssociateRoleLabel[AssociateRole.SOCIO_SOSTENITORE]},
    {value: AssociateRole.SOCIO_TESORIERE, label: AssociateRoleLabel[AssociateRole.SOCIO_TESORIERE]},
];

export const typesOfAssociates = [
    {
        value: 'scuola-asc',
        label: 'A.S.C.',
    },
    {
        value: 'asd-o-ssd',
        label: 'A.S.D. o S.S.D.',
    },
    {
        value: 'atleta',
        label: 'Atleta Amatore',
    },
    {
        value: 'atleta-agonista',
        label: 'Atleta Agonista',
    },
    {
        value: 'istruttore',
        label: 'Istruttore',
    },
    {
        value: 'maestro',
        label: 'Maestro',
    },
    {
        value: 'maestro-caposcuola',
        label: 'Maestro Caposcuola',
    },
    {
        value: 'arbitro',
        label: 'Arbitro',
    },
    {
        value: 'allenatore',
        label: 'Allenatore',
    },
    {
        value: 'consigliere',
        label: 'Consigliere',
    },
    {
        value: 'presidente',
        label: 'Presidente',
    },
];
