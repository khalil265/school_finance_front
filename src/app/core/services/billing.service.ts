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
  GenerateScheduleRequest,
  ScheduleGenerationResponse,
  StudentFinancialSummary
} from '../../shared/models/billing.model';


@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private readonly apiUrl =
    `${environment.apiUrl}/billing`;


  constructor(
    private readonly http: HttpClient
  ) {}


  getSummary(
    studentId: string,
    academicYearId: string
  ): Observable<StudentFinancialSummary> {

    const params =
      new HttpParams()
        .set('academicYearId', academicYearId);


    return this.http.get<StudentFinancialSummary>(
      `${this.apiUrl}/students/${studentId}/summary`,
      {
        params
      }
    );
  }


  refreshSummary(
    studentId: string,
    academicYearId: string
  ): Observable<StudentFinancialSummary> {

    const params =
      new HttpParams()
        .set('academicYearId', academicYearId);


    return this.http.post<StudentFinancialSummary>(
      `${this.apiUrl}/students/${studentId}/refresh`,
      {},
      {
        params
      }
    );
  }


  generateSchedule(
    request: GenerateScheduleRequest
  ): Observable<ScheduleGenerationResponse> {

    return this.http.post<ScheduleGenerationResponse>(
      `${this.apiUrl}/schedules/generate`,
      request
    );
  }
}