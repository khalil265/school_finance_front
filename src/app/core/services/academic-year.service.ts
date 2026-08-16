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
  AcademicYear
} from '../../shared/models/academic-year.model';


@Injectable({
  providedIn: 'root'
})
export class AcademicYearService {

  private readonly apiUrl =
    `${environment.apiUrl}/academic/years`;


  constructor(
    private readonly http: HttpClient
  ) {}


  findAll(
    establishmentId: string
  ): Observable<AcademicYear[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<AcademicYear[]>(
      this.apiUrl,
      {
        params
      }
    );
  }
}