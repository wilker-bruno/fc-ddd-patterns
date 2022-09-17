import Customer from "../../customer/entity/customer";
import CustomerChangeAddressEvent from "../../customer/event/customer-change-address.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import NotifyWhenCustomerChangeAddressHandler from "../../customer/event/handler/notify-when-customer-change-address.handler";
import NotifyWhenCustomerIsCreatedHandler from "../../customer/event/handler/notify-when-customer-is-created.handler copy";
import SendEmailWhenCustomerIsCreatedHandler from "../../customer/event/handler/send-email-when-customer-is-created.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should notify all event handlers when customer is created", () => {
    const eventDispatcher = new EventDispatcher();

    const notify = new NotifyWhenCustomerIsCreatedHandler();
    const spyNotifyHandler = jest.spyOn(notify, "handle");
    
    const sendEmail = new SendEmailWhenCustomerIsCreatedHandler();
    const spySendEmailHandler = jest.spyOn(sendEmail, "handle");

    eventDispatcher.register("CustomerCreatedEvent", notify);
    eventDispatcher.register("CustomerCreatedEvent", sendEmail);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toHaveLength(2);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toEqual(notify);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toEqual(sendEmail);

    const customerCreatedEvent = new CustomerCreatedEvent(new Customer('C1', 'Customer 1'));

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyNotifyHandler).toHaveBeenCalled();
    expect(spySendEmailHandler).toHaveBeenCalled();
  });

  it("should notify all event handlers when customer change address", () => {
    const eventDispatcher = new EventDispatcher();

    const notify = new NotifyWhenCustomerChangeAddressHandler();
    const spyNotifyHandler = jest.spyOn(notify, "handle");

    eventDispatcher.register("CustomerChangeAddressEvent", notify);

    expect(eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"]).toHaveLength(1);
    expect(eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"][0]).toEqual(notify);

    const customerChangeAddressEvent = new CustomerChangeAddressEvent({
      customerId: 'C1',
      customerName: 'Customer 1',
      customerAddress: new Address('Rua', 123, '62900000', 'Russas')
    });

    eventDispatcher.notify(customerChangeAddressEvent);

    expect(spyNotifyHandler).toHaveBeenCalled();
  });
});
