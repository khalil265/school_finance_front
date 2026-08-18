import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  Supplier,
  SupplierCreateRequest
} from '../../shared/models/supplier.model';


@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private readonly apiUrl =
    `${environment.apiUrl}/suppliers`;


  constructor(
    private readonly http: HttpClient
  ) {}


  list(
    establishmentId: string
  ): Observable<Supplier[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<Supplier[]>(
      this.apiUrl,
      {
        params
      }
    );
  }


  create(
    request: SupplierCreateRequest
  ): Observable<Supplier> {

    return this.http.post<Supplier>(
      this.apiUrl,
      request
    );
  }
}