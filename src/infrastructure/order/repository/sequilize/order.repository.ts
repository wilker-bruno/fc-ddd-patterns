import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  update(entity: Order): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async find(id: string): Promise<Order> {
    const model = await OrderModel.findOne({ where: { id }, include: ["items"] });
    return this.toOrder(model);
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({ include: ['items'] });
    return this.toOrders(orders);
  }

  private toOrder(model: OrderModel): Order {
    const items = this.toOrdersItems(model.items);
    return new Order(model.id, model.customer_id, items);
  }

  private toOrders(models: OrderModel[]): Order[] {
    return models.map(model => this.toOrder(model));
  }

  private toOrderItem(model: OrderItemModel): OrderItem {
    return new OrderItem(model.id, model.name, model.price, model.product_id, model.quantity);
  }

  private toOrdersItems(models: OrderItemModel[]): OrderItem[] {
    return models.map(model => this.toOrderItem(model));
  }
}
