import { Service } from './Service';

export type ServiceOrder = {
  id?: string;
  customer?: string;
  servicesDoneId: string[];
  servicesDone?: Service[];
  date: Date;
  price?: number;
  isFromPack?: boolean;
  image?: string;
}
