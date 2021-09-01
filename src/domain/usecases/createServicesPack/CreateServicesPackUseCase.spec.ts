import { ServiceType } from '@domain/entities/ServiceType';
import { IServicesPackRepository } from '@domain/interfaces/IServicesPackRepository';
import { IServiceTypeRepository } from '@domain/interfaces/IServiceTypeRepository';
import { ApiError } from '@shared/errors/ApiError';

import { CreateServicesPackUseCase } from './CreateServicesPackUseCase';

describe('Create Services Pack', () => {
  const servicesType: ServiceType[] = [];
  let createServicesPackUsecase: CreateServicesPackUseCase;
  let serviceTypeRepository: IServiceTypeRepository;
  let servicesPackRepository: IServicesPackRepository;

  beforeAll(() => {
    servicesType.push({
      name: 'Manicure',
      id: '123',
    }, {
      name: 'Pedicure',
      id: '345',
    });

    serviceTypeRepository = {
      create: null,
      destroy: null,
      findAll: null,
      findById: null,
      findByName: null,
      findByIds: jest.fn((x) => Promise.resolve(servicesType)),
      update: null,
    };

    servicesPackRepository = {
      create: jest.fn((x) => Promise.resolve(x)),
      update: null,
      destroy: null,
      findAll: null,
      findById: null,
      findByMonth: null,
    };
  });

  beforeEach(() => {
    createServicesPackUsecase = new CreateServicesPackUseCase(
      serviceTypeRepository, servicesPackRepository,
    );
  });

  it('should create a new services pack', async () => {
    const pack = await createServicesPackUsecase.execute({
      customer: 'Débora',
      price: 120,
      startDate: new Date(),
      servicesCount: [{
        quantity: 4,
        serviceTypeId: '1234',
      }, {
        quantity: 2,
        serviceTypeId: '5678',
      }],
    });

    expect(pack).toHaveProperty('id');
    expect(pack.id).toBeTruthy();
  });

  it('should not create a pack if any service type doesnt exists', async () => {
    const customRepository = {
      ...serviceTypeRepository,
      findByIds: jest.fn(() => Promise.resolve([])),
    };

    createServicesPackUsecase = new CreateServicesPackUseCase(
      customRepository, servicesPackRepository,
    );

    expect(async () => {
      await createServicesPackUsecase.execute({
        customer: 'Débora',
        price: 120,
        startDate: new Date(),
        servicesCount: [{
          quantity: 4,
          serviceTypeId: '1234',
        }, {
          quantity: 2,
          serviceTypeId: '5678',
        }],
      });
    }).rejects.toBeInstanceOf(ApiError);
  });

  it('should not create a pack without services count', async () => {
    expect(async () => {
      await createServicesPackUsecase.execute({
        customer: 'Débora',
        price: 120,
        startDate: new Date(),
        servicesCount: [],
      });
    }).rejects.toBeInstanceOf(ApiError);
  });

  it('should remove all items from services count with quantity less than 1', async () => {
    const pack = await createServicesPackUsecase.execute({
      customer: 'Débora',
      price: 120,
      startDate: new Date(),
      servicesCount: [
        {
          quantity: 4,
          serviceTypeId: '1234',
        }, {
          quantity: 4,
          serviceTypeId: '1234',
        }, {
          quantity: 0,
          serviceTypeId: '5678',
        }],
      services: [],
    });

    expect(pack.servicesCount.filter((item) => item.quantity < 1)).toHaveLength(0);
  });
});
