export interface IInvestigationInterface {
    labRequest: {
        requestType: string,
        request_note: string,
        requestBody: {
            groups: string[],
            tests: string[],
        },
    };
    imagingRequest: {
        requestType: string,
        request_note: string,
        requestBody: string[],
    };
}
