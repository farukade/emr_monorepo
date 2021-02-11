export interface IInvestigationInterface {
    labRequest: {
        requestType: string,
        request_note: string,
        items: string[],
        urgent: boolean,
    };
    imagingRequest: {
        requestType: string,
        request_note: string,
        items: string[],
        urgent: boolean,
    };
}
