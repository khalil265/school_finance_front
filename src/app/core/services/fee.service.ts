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
  FeeStructure,
  FeeStructureCreateRequest,
  FeeType,
  FeeTypeCreateRequest
} from '../../shared/models/fee.model';


@Injectable({
  providedIn: 'root'
})
export class FeeService {

  private readonly apiUrl =
    `${environment.apiUrl}/fees`;


  constructor(
    private readonly http: HttpClient
  ) {}


  getTypes(
    establishmentId: string
  ): Observable<FeeType[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<FeeType[]>(
      `${this.apiUrl}/types`,
      {
        params
      }
    );
  }


  createType(
    request: FeeTypeCreateRequest
  ): Observable<FeeType> {

    return this.http.post<FeeType>(
      `${this.apiUrl}/types`,
      request
    );
  }


  getStructures(
    establishmentId: string,
    academicYearId: string,
    levelId: string
  ): Observable<FeeStructure[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId)
        .set('academicYearId', academicYearId)
        .set('levelId', levelId);


    return this.http.get<FeeStructure[]>(
      `${this.apiUrl}/structures`,
      {
        params
      }
    );
  }


  createStructure(
    request: FeeStructureCreateRequest
  ): Observable<FeeStructure> {

    return this.http.post<FeeStructure>(
      `${this.apiUrl}/structures`,
      request
    );
  }
}