export interface IInvestigationInterface {
    labRequest: {
        requestType: string,
        patient_id: number,
        tests: object[],
        request_note: string,
        urgent: boolean,
    };
    radiologyRequest: {
        requestType: string,
        patient_id: number,
        tests: object[],
        urgent: boolean,
        request_note: string,
    };
    pharmacyRequest: {
        requestType: string,
        patient_id: number,
        items: object[],
        request_note: string,
    };
    procedureRequest: {
        requestType: string,
        patient_id: number,
        tests: object[],
        request_note: string,
        urgent: boolean,
        diagnosis: any[],
        bill: string,
    };
}
