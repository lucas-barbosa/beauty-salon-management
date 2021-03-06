import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  startAt,
  where,
} from 'firebase/firestore';
import { injectable } from 'tsyringe';

import { Service } from '@domain/modules/services/entities/Service';
import { IServiceRepository } from '@domain/modules/services/interfaces/IServiceRepository';
import { PaginationProps } from '@shared/types/pagination';

import { Firebase } from '../shared/Firebase';

@injectable()
export class ServiceRepository implements IServiceRepository {
  readonly db: Firestore;
  readonly tableName: string;
  readonly table: CollectionReference;

  constructor() {
    this.db = Firebase.database;
    this.tableName = 'services';
    this.table = collection(this.db, this.tableName);
  }

  async create({ id, name }: Service): Promise<Service> {
    await setDoc(doc(this.table, id), {
      id,
      name,
    });

    return { id, name };
  }

  async update({ id, name }: Service): Promise<Service> {
    await setDoc(doc(this.table, id), {
      id,
      name,
    });

    return { id, name };
  }

  async destroy(id: string): Promise<string> {
    await deleteDoc(doc(this.table, id));
    return id;
  }

  async findAll({ page, limit: pageSize }: PaginationProps): Promise<Service[]> {
    const offsetSize = pageSize * (page - 1) + 1;

    const allDocs = await getDocs(
      query(
        this.table,
        limit(offsetSize),
      ),
    );

    if (!allDocs.docs?.length || allDocs.docs?.length < offsetSize) return [];

    const lastVisible = allDocs.docs[allDocs.docs.length - 1];

    const snapshot = await getDocs(
      query(
        this.table,
        startAt(lastVisible),
        limit(pageSize),
      ),
    );

    if (snapshot.empty) return [];

    return snapshot.docs.map((item) => item.data() as Service);
  }

  async findById(id: string): Promise<Service> {
    const snapshot = await getDoc(doc(this.table, id));

    if (!snapshot.exists) return null;

    return snapshot.data() as Service;
  }

  async findByIds(ids: string[]): Promise<Service[]> {
    if (!ids?.length) return [];

    const snapshot = await getDocs(query(this.table, where('id', 'in', ids)));

    if (snapshot.empty) return [];

    return snapshot.docs.map((item) => item.data() as Service);
  }

  async findByName(name: string): Promise<Service> {
    const snapshot = await getDocs(query(this.table, where('name', '==', name), limit(1)));

    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as Service;
  }
}
