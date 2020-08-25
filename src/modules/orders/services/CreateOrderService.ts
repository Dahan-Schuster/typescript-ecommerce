import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
	id: string;
	quantity: number;
}

interface IRequest {
	customer_id: string;
	products: IProduct[];
}

@injectable()
class CreateOrderService {
	constructor(
		@inject('OrdersRepository')
		private ordersRepository: IOrdersRepository,

		@inject('ProductsRepository')
		private productsRepository: IProductsRepository,

		@inject('CustomersRepository')
		private customersRepository: ICustomersRepository,
	) {}

	public async execute({ customer_id, products }: IRequest): Promise<Order> {
		const customer = await this.customersRepository.findById(customer_id);

		if (!customer) throw new AppError('Costumer not found');

		const existentProducts = await this.productsRepository.findAllById(
			products,
		);

		const existentProductsIDs = existentProducts.map(p => p.id);

		const checkNonExistentProducts = products.filter(
			product => !existentProductsIDs.includes(product.id),
		);
		if (checkNonExistentProducts.length)
			throw new AppError('Could not find one or more products');

		const findProductsWithNoQuantityAvailable = products.filter(product => {
			const existentProduct = existentProducts.find(
				p => p.id === product.id,
			);

			if (existentProduct) {
				return product.quantity > existentProduct.quantity;
			}

			return false;
		});

		if (findProductsWithNoQuantityAvailable.length)
			throw new AppError(
				'One or more products does not have sufficient quantity available',
			);

		const parsedProducts = products.map(product => ({
			product_id: product.id,
			quantity: product.quantity,
			price: existentProducts.find(p => p.id === product.id)?.price || 0,
		}));

		const order = await this.ordersRepository.create({
			customer,
			products: parsedProducts,
		});

		const { order_products } = order;
		const updatedProducts = order_products.map(product => {
			const existentProduct = existentProducts.find(
				p => p.id === product.product_id,
			);
			let quantity = 0;

			if (existentProduct) {
				quantity = existentProduct.quantity - product.quantity;
			}

			return {
				id: product.product_id,
				quantity,
			};
		});

		await this.productsRepository.updateQuantity(updatedProducts);

		return order;
	}
}

export default CreateOrderService;
