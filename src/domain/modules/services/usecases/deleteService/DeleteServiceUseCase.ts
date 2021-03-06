import { inject, injectable } from 'tsyringe';

import { IServiceRepository } from '@domain/modules/services/interfaces/IServiceRepository';

@injectable()
export class DeleteServiceUsecase {
  constructor(
    @inject('ServiceRepository')
    private readonly servicesRepository: IServiceRepository,
  ) {}

  async execute(id: string): Promise<string> {
    return this.servicesRepository.destroy(id);
  }
}
