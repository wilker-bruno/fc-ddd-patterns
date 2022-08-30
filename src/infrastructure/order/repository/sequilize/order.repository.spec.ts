import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import CustomerFactory from "../../../../domain/customer/factory/customer.factory";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const productRepository = new ProductRepository();
    const customerRepository = new CustomerRepository();

    const customer = CustomerFactory.createWithAddress("Customer 1", new Address("Street 1", 1, "Zipcode 1", "City 1"));
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: order.id,
          product_id: product.id,
        },
      ],
    });
  });

  it("should find an order by id", async () => {
    const productRepository = new ProductRepository();
    const customerRepository = new CustomerRepository();

    const customer = CustomerFactory.createWithAddress("Customer 1", new Address("Street 1", 1, "Zipcode 1", "City 1"));
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderFound = await orderRepository.find(order.id);
    expect(orderFound).toStrictEqual(order);
  });

  it("should update an order", async () => {
    const productRepository = new ProductRepository();
    const customerRepository = new CustomerRepository();

    const customer = CustomerFactory.createWithAddress("Customer 1", new Address("Street 1", 1, "Zipcode 1", "City 1"));
    await customerRepository.create(customer);

    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);

    const order = new Order("123", customer.id, [
      new OrderItem("1", product1.name, product1.price, product1.id, 1)
    ]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const product2 = new Product("456", "Product 2", 20);
    await productRepository.create(product2);

    const newOrder = new Order(order.id, order.customerId, [
      new OrderItem("2", product2.name, product2.price, product2.id, 2)
    ]);

    await orderRepository.update(newOrder);

    const savedOrder = await orderRepository.find(newOrder.id);
    expect(savedOrder).toStrictEqual(newOrder);
  });

  it("should find all orders", async () => {
    const productRepository = new ProductRepository();
    const customerRepository = new CustomerRepository();

    const customer = CustomerFactory.createWithAddress("Customer 1", new Address("Street 1", 1, "Zipcode 1", "City 1"));
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const order1 = new Order("123", customer.id, [
      new OrderItem("1", product.name, product.price, product.id, 1)
    ]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);

    const order2 = new Order("456", customer.id, [
      new OrderItem("2", product.name, product.price, product.id, 2)
    ]);
    await orderRepository.create(order2);


    const orders = await orderRepository.findAll();

    expect(orders.find(o => o.id === order1.id)).toStrictEqual(order1);
    expect(orders.find(o => o.id === order2.id)).toStrictEqual(order2);
  });
});
