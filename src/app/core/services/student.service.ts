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
  Enrollment,
  Student,
  StudentCreateRequest,
  StudentPage,
  StudentUpdateRequest
} from '../../shared/models/student.model';


@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly apiUrl =
    `${environment.apiUrl}/students`;


  constructor(
    private readonly http: HttpClient
  ) {}


  findAll(
    page: number = 0,
    size: number = 10
  ): Observable<StudentPage> {

    const params =
      new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('sort', 'createdAt,desc');


    return this.http.get<StudentPage>(
      this.apiUrl,
      {
        params
      }
    );
  }


  search(
    query: string,
    page: number = 0,
    size: number = 10
  ): Observable<StudentPage> {

    const params =
      new HttpParams()
        .set('q', query)
        .set('page', page)
        .set('size', size);


    return this.http.get<StudentPage>(
      `${this.apiUrl}/search`,
      {
        params
      }
    );
  }


  findById(
    id: string
  ): Observable<Student> {

    return this.http.get<Student>(
      `${this.apiUrl}/${id}`
    );
  }


  create(
    request: StudentCreateRequest
  ): Observable<Student> {

    return this.http.post<Student>(
      this.apiUrl,
      request
    );
  }


  update(
    id: string,
    request: StudentUpdateRequest
  ): Observable<Student> {

    return this.http.put<Student>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  getEnrollments(
    studentId: string
  ): Observable<Enrollment[]> {

    return this.http.get<Enrollment[]>(
      `${this.apiUrl}/${studentId}/enrollments`
    );
  }
}