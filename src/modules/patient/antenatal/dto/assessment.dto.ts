export class AssessmentDto {
	comment: string;
	measurement: {
		vitals: any;
		brim: string;
		fetal_lie: string;
		position_of_foetus: string;
	};
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
	nextAppointment: {
		datetime: string;
		duration: string;
		duration_type: string;
		doctor_id: any;
	};
	appointment_id: any;
}
