import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
	name: string;
	price: number;
	quantity: number;
}

@injectable()
class CreateProductService {
	constructor(
		@inject('ProductsRepository')
		private productsRepository: IProductsRepository,
	) {}

	public async execute({
		name,
		price,
		quantity,
	}: IRequest): Promise<Product> {
		const productAlreadyExists = await this.productsRepository.findByName(
			name,
		);

		if (productAlreadyExists)
			throw new AppError(
				'A product with the same name was already created',
			);

		return this.productsRepository.create({
			name,
			price,
			quantity,
		});
	}
}

export default CreateProductService;
