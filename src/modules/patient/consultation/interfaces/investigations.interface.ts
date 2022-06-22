export interface IInvestigationInterface {
  labRequest: {
    requestType: string;
    patient_id: number;
    tests: object[];
    request_note: string;
    urgent: boolean;
    pay_later: number;
  };
  radiologyRequest: {
    requestType: string;
    patient_id: number;
    tests: object[];
    urgent: boolean;
    request_note: string;
    pay_later: number;
  };
  pharmacyRequest: {
    requestType: string;
    patient_id: number;
    items: object[];
    request_note: string;
  };
  procedureRequest: {
    requestType: string;
    patient_id: number;
    tests: object[];
    request_note: string;
    urgent: boolean;
    diagnosis: any[];
    bill: string;
  };
}
