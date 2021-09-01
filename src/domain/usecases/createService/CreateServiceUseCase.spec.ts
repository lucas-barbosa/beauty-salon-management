import { IServiceRepository } from '@domain/interfaces/IServiceRepository';
import { IServiceTypeRepository } from '@domain/interfaces/IServiceTypeRepository';
import { ApiError } from '@shared/errors/ApiError';

import { CreateServiceUseCase } from './CreateServiceUseCase';

describe('Create Service', () => {
  let usecase: CreateServiceUseCase;
  let serviceRepository: IServiceRepository;
  let serviceTypeRepository: IServiceTypeRepository;

  beforeEach(() => {
    serviceTypeRepository = {
      create: null,
      update: null,
      destroy: null,
      findAll: null,
      findById: jest.fn(() => Promise.resolve({
        name: 'Manicure',
        id: '1234',
      })),
      findByIds: jest.fn(() => Promise.resolve([
        { name: 'Manicure', id: '1234' },
        { name: 'Pedicure', id: '4567' },
      ])),
      findByName: null,
    };

    serviceRepository = {
      create: jest.fn((x) => Promise.resolve(x)),
      update: null,
      destroy: null,
      findByIds: null,
      findAll: null,
      findById: null,
      findByMonth: null,
    };

    usecase = new CreateServiceUseCase(serviceTypeRepository, serviceRepository);
  });

  it('should create a new service', async () => {
    const service = await usecase.execute({
      customer: 'Débora',
      date: new Date(),
      servicesDoneIds: ['1234'],
      price: 25,
    });

    expect(service).toHaveProperty('id');
    expect(service.id).toBeTruthy();
  });

  it('should persists the created object on database', async () => {
    const service = await usecase.execute({
      customer: 'Débora',
      date: new Date(),
      servicesDoneIds: ['1234'],
      price: 45,
    });

    expect(serviceRepository.create).toBeCalledWith(service);
  });

  it('should not create if any service type doesnt exists', async () => {
    const customRepository = {
      ...serviceTypeRepository,
      findByIds: jest.fn(() => Promise.resolve([])),
    };

    usecase = new CreateServiceUseCase(customRepository, serviceRepository);

    expect(async () => {
      await usecase.execute({
        customer: 'Débora',
        date: new Date(),
        servicesDoneIds: ['1234'],
        price: 45,
      });
    }).rejects.toBeInstanceOf(ApiError);
  });

  it('should not create object without services done ids', async () => {
    expect(async () => {
      await usecase.execute({
        customer: 'Débora',
        date: new Date(),
        servicesDoneIds: [],
        price: 45,
      });
    }).rejects.toBeInstanceOf(ApiError);
  });

  it('should have property isFromPack equals to false', async () => {
    const service = await usecase.execute({
      customer: 'Débora',
      date: new Date(),
      servicesDoneIds: ['1234'],
      price: 45,
    });

    expect(service.isFromPack).toBe(false);
  });
});
