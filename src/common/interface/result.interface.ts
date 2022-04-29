export interface Result {
	data: any;

	/**
	 * success status
	 */
	success: boolean;

	/**
	 * the message if success is false
	 */
	message: string;
}
