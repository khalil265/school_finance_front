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
  Level
} from '../../shared/models/level.model';


@Injectable({
  providedIn: 'root'
})
export class LevelService {

  private readonly apiUrl =
    `${environment.apiUrl}/academic/levels`;


  constructor(
    private readonly http: HttpClient
  ) {}


  findAll(
    establishmentId: string
  ): Observable<Level[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<Level[]>(
      this.apiUrl,
      {
        params
      }
    );
  }
}