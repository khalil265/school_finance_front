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
  SchoolClass
} from '../../shared/models/school-class.model';


@Injectable({
  providedIn: 'root'
})
export class SchoolClassService {

  private readonly apiUrl =
    `${environment.apiUrl}/academic/classes`;


  constructor(
    private readonly http: HttpClient
  ) {}


  findAll(
    establishmentId: string,
    academicYearId: string
  ): Observable<SchoolClass[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId)
        .set('academicYearId', academicYearId);


    return this.http.get<SchoolClass[]>(
      this.apiUrl,
      {
        params
      }
    );
  }
}