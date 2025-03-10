export interface GraphEntity {
    id: string;
    localId: string;
    type: "Event" | "Msg";
    subject: string;
    participants: string[] | undefined;
    lastModifiedDateTime: string;
}
//# sourceMappingURL=graphEntity.d.ts.map