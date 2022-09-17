import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddressEvent from "../customer-change-address.event";
import CustomerCreatedEvent from "../customer-created.event";

export default class NotifyWhenCustomerChangeAddressHandler implements EventHandlerInterface<CustomerChangeAddressEvent> {
    handle(event: CustomerChangeAddressEvent): void {
        console.log(`Endereço do cliente: ${event.eventData.customerId}, ${event.eventData.customerName} alterado para: ${event.eventData.customerAddress}`);
    }
}