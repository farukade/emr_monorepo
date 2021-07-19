export interface Result {
    data: any;

    /**
     * the last page
     */
    success: boolean;

    /**
     * the message if success is false
     */
    message: string;
}
