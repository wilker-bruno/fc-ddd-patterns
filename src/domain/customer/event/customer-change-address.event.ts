import EventInterface from "../../@shared/event/event.interface";

export default class CustomerChangeAddressEvent implements EventInterface {
    eventData: any;
    dataTimeOccurred: Date;

    constructor(data: any) {
        this.eventData = data;
        this.dataTimeOccurred = new Date();
    }
}