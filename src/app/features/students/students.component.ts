import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  StudentService
} from '../../core/services/student.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  Student,
  StudentCreateRequest,
  StudentUpdateRequest
} from '../../shared/models/student.model';


@Component({
  selector: 'app-students',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './students.component.html',

  styleUrl:
    './students.component.css'
})
export class StudentsComponent implements OnInit {

  private readonly studentService =
    inject(StudentService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  students: Student[] = [];

  selectedStudent: Student | null = null;

  editingStudent: Student | null = null;

  searchQuery = '';

  loading = false;

  saving = false;

  errorMessage = '';

  formError = '';

  successMessage = '';

  formVisible = false;


  page = 0;

  pageSize = 10;

  totalPages = 0;

  totalElements = 0;


  readonly studentForm =
    this.fb.nonNullable.group({

      registrationNumber: [
        '',
        [
          Validators.required
        ]
      ],

      firstName: [
        '',
        [
          Validators.required
        ]
      ],

      lastName: [
        '',
        [
          Validators.required
        ]
      ],

      gender: [
        'MALE',
        [
          Validators.required
        ]
      ],

      dateOfBirth: [''],

      placeOfBirth: [''],

      nationality: ['Senegalaise'],

      phone: [''],

      email: [
        '',
        [
          Validators.email
        ]
      ],

      address: [''],

      guardianName: [''],

      guardianPhone: [''],

      guardianEmail: [
        '',
        [
          Validators.email
        ]
      ],

      status: ['ACTIVE']

    });


  get canCreate(): boolean {

    return this.authService
      .hasPermission('STUDENT_CREATE');
  }


  get canUpdate(): boolean {

    return this.authService
      .hasPermission('STUDENT_UPDATE');
  }


  ngOnInit(): void {

    this.loadStudents();
  }


  loadStudents(): void {

    this.loading = true;

    this.errorMessage = '';


    const request =
      this.searchQuery.trim()
        ? this.studentService.search(
            this.searchQuery.trim(),
            this.page,
            this.pageSize
          )
        : this.studentService.findAll(
            this.page,
            this.pageSize
          );


    request.subscribe({

      next: response => {

        this.students =
          response.content ?? [];

        this.totalPages =
          response.totalPages ?? 0;

        this.totalElements =
          response.totalElements ?? 0;

        this.loading = false;
      },

      error: error => {

        console.error(
          'Erreur chargement élèves',
          error
        );

        this.errorMessage =
          'Impossible de charger la liste des élèves.';

        this.loading = false;
      }

    });
  }


  openCreateForm(): void {

    this.editingStudent = null;

    this.formError = '';

    this.successMessage = '';

    this.studentForm.reset({

      registrationNumber: '',

      firstName: '',

      lastName: '',

      gender: 'MALE',

      dateOfBirth: '',

      placeOfBirth: '',

      nationality: 'Senegalaise',

      phone: '',

      email: '',

      address: '',

      guardianName: '',

      guardianPhone: '',

      guardianEmail: '',

      status: 'ACTIVE'

    });


    this.studentForm
      .controls
      .registrationNumber
      .enable();


    this.formVisible = true;
  }


  openEditForm(
    student: Student
  ): void {

    this.editingStudent = student;

    this.formError = '';

    this.successMessage = '';


    this.studentForm.patchValue({

      registrationNumber:
        student.registrationNumber,

      firstName:
        student.firstName,

      lastName:
        student.lastName,

      gender:
        student.gender,

      dateOfBirth:
        student.dateOfBirth ?? '',

      placeOfBirth:
        student.placeOfBirth ?? '',

      nationality:
        student.nationality ?? '',

      phone:
        student.phone ?? '',

      email:
        student.email ?? '',

      address:
        student.address ?? '',

      guardianName:
        student.guardianName ?? '',

      guardianPhone:
        student.guardianPhone ?? '',

      guardianEmail:
        student.guardianEmail ?? '',

      status:
        student.status

    });


    this.studentForm
      .controls
      .registrationNumber
      .disable();


    this.formVisible = true;

    this.selectedStudent = null;
  }


  closeForm(): void {

    if (this.saving) {
      return;
    }

    this.formVisible = false;

    this.editingStudent = null;

    this.formError = '';
  }


  saveStudent(): void {

    this.formError = '';

    this.successMessage = '';


    if (this.studentForm.invalid) {

      this.studentForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    if (this.editingStudent) {

      this.updateStudent();

    }
    else {

      this.createStudent();
    }
  }


  private createStudent(): void {

    const value =
      this.studentForm.getRawValue();


    const request: StudentCreateRequest = {

      establishmentId:
        this.appContext.establishmentId(),

      registrationNumber:
        value.registrationNumber.trim(),

      firstName:
        value.firstName.trim(),

      lastName:
        value.lastName.trim(),

      gender:
        value.gender,

      dateOfBirth:
        this.nullIfEmpty(
          value.dateOfBirth
        ),

      placeOfBirth:
        this.nullIfEmpty(
          value.placeOfBirth
        ),

      nationality:
        this.nullIfEmpty(
          value.nationality
        ),

      phone:
        this.nullIfEmpty(
          value.phone
        ),

      email:
        this.nullIfEmpty(
          value.email
        ),

      address:
        this.nullIfEmpty(
          value.address
        ),

      guardianName:
        this.nullIfEmpty(
          value.guardianName
        ),

      guardianPhone:
        this.nullIfEmpty(
          value.guardianPhone
        ),

      guardianEmail:
        this.nullIfEmpty(
          value.guardianEmail
        )

    };


    this.studentService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: student => {

          this.successMessage =
            `Élève ${student.registrationNumber} créé avec succès.`;

          this.formVisible = false;

          this.page = 0;

          this.loadStudents();
        },

        error: error => {

          this.handleSaveError(error);
        }

      });
  }


  private updateStudent(): void {

    if (!this.editingStudent) {
      return;
    }


    const value =
      this.studentForm.getRawValue();


    const request: StudentUpdateRequest = {

      firstName:
        value.firstName.trim(),

      lastName:
        value.lastName.trim(),

      gender:
        value.gender,

      dateOfBirth:
        this.nullIfEmpty(
          value.dateOfBirth
        ),

      placeOfBirth:
        this.nullIfEmpty(
          value.placeOfBirth
        ),

      nationality:
        this.nullIfEmpty(
          value.nationality
        ),

      phone:
        this.nullIfEmpty(
          value.phone
        ),

      email:
        this.nullIfEmpty(
          value.email
        ),

      address:
        this.nullIfEmpty(
          value.address
        ),

      guardianName:
        this.nullIfEmpty(
          value.guardianName
        ),

      guardianPhone:
        this.nullIfEmpty(
          value.guardianPhone
        ),

      guardianEmail:
        this.nullIfEmpty(
          value.guardianEmail
        ),

      status:
        value.status

    };


    this.studentService
      .update(
        this.editingStudent.id,
        request
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: student => {

          this.successMessage =
            `Élève ${student.registrationNumber} modifié avec succès.`;

          this.formVisible = false;

          this.editingStudent = null;

          this.loadStudents();
        },

        error: error => {

          this.handleSaveError(error);
        }

      });
  }


  private handleSaveError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur sauvegarde élève',
      error
    );


    if (error.status === 409) {

      this.formError =
        error.error?.message
        ?? 'Un élève avec ce matricule existe déjà.';

      return;
    }


    if (error.status === 403) {

      this.formError =
        'Vous ne disposez pas des droits nécessaires.';

      return;
    }


    if (error.status === 400) {

      this.formError =
        error.error?.message
        ?? 'Les informations saisies sont invalides.';

      return;
    }


    this.formError =
      'Impossible d’enregistrer l’élève.';
  }


  search(): void {

    this.page = 0;

    this.loadStudents();
  }


  clearSearch(): void {

    this.searchQuery = '';

    this.page = 0;

    this.loadStudents();
  }


  previousPage(): void {

    if (this.page <= 0) {
      return;
    }

    this.page--;

    this.loadStudents();
  }


  nextPage(): void {

    if (
      this.page + 1 >=
      this.totalPages
    ) {
      return;
    }

    this.page++;

    this.loadStudents();
  }


  selectStudent(
    student: Student
  ): void {

    this.selectedStudent = student;
  }


  closeDetails(): void {

    this.selectedStudent = null;
  }


  fullName(
    student: Student
  ): string {

    return `${student.firstName} ${student.lastName}`;
  }


  genderLabel(
    gender: string
  ): string {

    switch (gender) {

      case 'MALE':
        return 'Masculin';

      case 'FEMALE':
        return 'Féminin';

      default:
        return gender || '-';
    }
  }


  statusLabel(
    status: string
  ): string {

    switch (status) {

      case 'ACTIVE':
        return 'Actif';

      case 'INACTIVE':
        return 'Inactif';

      case 'SUSPENDED':
        return 'Suspendu';

      case 'GRADUATED':
        return 'Diplômé';

      default:
        return status || '-';
    }
  }


  private nullIfEmpty(
    value: string | null | undefined
  ): string | null {

    if (
      value == null ||
      value.trim() === ''
    ) {

      return null;
    }

    return value.trim();
  }
}