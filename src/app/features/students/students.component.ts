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
  AcademicYearService
} from '../../core/services/academic-year.service';

import {
  SchoolClassService
} from '../../core/services/school-class.service';

import {
  Enrollment,
  Student,
  StudentCreateRequest,
  StudentUpdateRequest
} from '../../shared/models/student.model';

import {
  AcademicYear
} from '../../shared/models/academic-year.model';

import {
  SchoolClass
} from '../../shared/models/school-class.model';


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

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly schoolClassService =
    inject(SchoolClassService);

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

  generatingRegistrationNumber = false;


  photoPreview: string | null = null;


  page = 0;

  pageSize = 10;

  totalPages = 0;

  totalElements = 0;


  readonly nationalities: string[] = [

    'Senegalaise',
    'Malienne',
    'Mauritanienne',
    'Gambienne',
    'Guineenne',
    'Bissau-Guineenne',
    'Ivoirienne',
    'Burkinabe',
    'Nigerienne',
    'Togolaise',
    'Beninoise',
    'Ghaneenne',
    'Camerounaise',
    'Marocaine',
    'Francaise',
    'Autre'

  ];


  enrollingStudent: Student | null = null;

  enrollFormVisible = false;

  academicYears: AcademicYear[] = [];

  schoolClasses: SchoolClass[] = [];

  studentEnrollments: Enrollment[] = [];

  loadingAcademicYears = false;

  loadingClasses = false;

  loadingEnrollments = false;

  savingEnrollment = false;

  enrollError = '';

  enrollSuccess = '';


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


  readonly enrollForm =
    this.fb.nonNullable.group({

      academicYearId: [
        '',
        [
          Validators.required
        ]
      ],

      schoolClassId: [
        '',
        [
          Validators.required
        ]
      ],

      classNumber: [
        null as number | null
      ],

      enrollmentDate: [''],

      notes: ['']

    });


  get canCreate(): boolean {

    return this.authService
      .hasPermission('STUDENT_CREATE');
  }


  get canUpdate(): boolean {

    return this.authService
      .hasPermission('STUDENT_UPDATE');
  }


  get canEnroll(): boolean {

    return this.authService
      .hasPermission('STUDENT_ENROLL');
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
          'Erreur chargement eleves',
          error
        );

        this.errorMessage =
          'Impossible de charger la liste des eleves.';

        this.loading = false;
      }

    });
  }


  openCreateForm(): void {

    this.editingStudent = null;

    this.formError = '';

    this.successMessage = '';

    this.photoPreview = null;

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
      .disable();


    this.formVisible = true;


    this.generateRegistrationNumber();
  }


  private generateRegistrationNumber(): void {

    this.generatingRegistrationNumber = true;


    this.studentService
      .findAll(0, 1)
      .pipe(
        finalize(() => {
          this.generatingRegistrationNumber = false;
        })
      )
      .subscribe({

        next: page => {

          this.applyGeneratedNumber(
            (page.totalElements ?? 0) + 1
          );
        },

        error: () => {

          this.applyGeneratedNumber(1);
        }

      });
  }


  private applyGeneratedNumber(
    sequence: number
  ): void {

    const year =
      new Date().getFullYear();

    const padded =
      sequence
        .toString()
        .padStart(4, '0');

    this.studentForm.patchValue({
      registrationNumber:
        `ELV-${year}-${padded}`
    });
  }


  openEditForm(
    student: Student
  ): void {

    this.editingStudent = student;

    this.formError = '';

    this.successMessage = '';

    this.photoPreview =
      student.photoBase64;


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
        student.nationality ?? 'Senegalaise',

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


  onPhotoSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }


    if (file.size > 2 * 1024 * 1024) {

      this.formError =
        'La photo ne doit pas depasser 2 Mo.';

      return;
    }


    const reader =
      new FileReader();

    reader.onload = () => {

      this.photoPreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }


  removePhoto(): void {

    this.photoPreview = null;
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
        ),

      photoBase64:
        this.photoPreview

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
            `Eleve ${student.registrationNumber} cree avec succes.`;

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
        value.status,

      photoBase64:
        this.photoPreview

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
            `Eleve ${student.registrationNumber} modifie avec succes.`;

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
      'Erreur sauvegarde eleve',
      error
    );


    if (error.status === 409) {

      this.formError =
        error.error?.message
        ?? 'Un eleve avec ce matricule existe deja. Un nouveau matricule va etre genere.';


      if (!this.editingStudent) {

        this.generateRegistrationNumber();
      }

      return;
    }


    if (error.status === 403) {

      this.formError =
        'Vous ne disposez pas des droits necessaires.';

      return;
    }


    if (error.status === 400) {

      this.formError =
        error.error?.message
        ?? 'Les informations saisies sont invalides.';

      return;
    }


    this.formError =
      "Impossible d'enregistrer l'eleve.";
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

    this.loadEnrollmentsFor(student);
  }


  closeDetails(): void {

    this.selectedStudent = null;

    this.studentEnrollments = [];
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
        return 'Feminin';

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
        return 'Diplome';

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


  private loadEnrollmentsFor(
    student: Student
  ): void {

    this.loadingEnrollments = true;


    this.studentService
      .getEnrollments(
        student.id
      )
      .pipe(
        finalize(() => {
          this.loadingEnrollments = false;
        })
      )
      .subscribe({

        next: enrollments => {

          this.studentEnrollments = enrollments;
        },

        error: () => {

          this.studentEnrollments = [];
        }

      });
  }


  openEnrollForm(
    student: Student
  ): void {

    this.enrollingStudent = student;

    this.enrollError = '';

    this.enrollSuccess = '';

    this.schoolClasses = [];

    this.enrollForm.reset({

      academicYearId: '',

      schoolClassId: '',

      classNumber: null,

      enrollmentDate: '',

      notes: ''

    });

    this.enrollFormVisible = true;


    this.loadAcademicYearsForEnroll();
  }


  closeEnrollForm(): void {

    if (this.savingEnrollment) {
      return;
    }

    this.enrollFormVisible = false;

    this.enrollingStudent = null;

    this.enrollError = '';
  }


  private loadAcademicYearsForEnroll(): void {

    this.loadingAcademicYears = true;


    this.academicYearService
      .findAll(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingAcademicYears = false;
        })
      )
      .subscribe({

        next: years => {

          this.academicYears = years;

          const current =
            years.find(y => y.currentYear);

          const yearId =
            current
              ? current.id
              : (years[0]?.id ?? '');

          this.enrollForm.patchValue({
            academicYearId: yearId
          });

          if (yearId) {

            this.loadClassesForYear(
              yearId
            );
          }
        },

        error: () => {

          this.enrollError =
            'Impossible de charger les annees academiques.';
        }

      });
  }


  onEnrollYearChange(): void {

    const yearId =
      this.enrollForm.controls.academicYearId.value;

    this.enrollForm.patchValue({
      schoolClassId: ''
    });

    if (yearId) {

      this.loadClassesForYear(
        yearId
      );

    }
    else {

      this.schoolClasses = [];
    }
  }


  private loadClassesForYear(
    academicYearId: string
  ): void {

    this.loadingClasses = true;


    this.schoolClassService
      .findAll(
        this.appContext.establishmentId(),
        academicYearId
      )
      .pipe(
        finalize(() => {
          this.loadingClasses = false;
        })
      )
      .subscribe({

        next: classes => {

          this.schoolClasses = classes;
        },

        error: () => {

          this.schoolClasses = [];
        }

      });
  }


  submitEnroll(): void {

    if (!this.enrollingStudent) {
      return;
    }


    this.enrollError = '';


    if (this.enrollForm.invalid) {

      this.enrollForm.markAllAsTouched();

      return;
    }


    this.savingEnrollment = true;


    const value =
      this.enrollForm.getRawValue();


    const request = {

      academicYearId:
        value.academicYearId,

      schoolClassId:
        value.schoolClassId,

      classNumber:
        value.classNumber,

      enrollmentDate:
        this.nullIfEmpty(
          value.enrollmentDate
        ),

      notes:
        this.nullIfEmpty(
          value.notes
        )

    };


    this.studentService
      .enroll(
        this.enrollingStudent.id,
        request
      )
      .pipe(
        finalize(() => {
          this.savingEnrollment = false;
        })
      )
      .subscribe({

        next: enrollment => {

          this.enrollSuccess =
            `Inscription confirmee en ${enrollment.schoolClass}.`;

          this.enrollFormVisible = false;


          if (
            this.selectedStudent &&
            this.enrollingStudent &&
            this.selectedStudent.id === this.enrollingStudent.id
          ) {

            this.loadEnrollmentsFor(
              this.selectedStudent
            );
          }

          this.enrollingStudent = null;
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur inscription eleve',
            error
          );


          if (error.status === 409) {

            this.enrollError =
              error.error?.message
              ?? "L'eleve est deja inscrit pour cette annee academique.";

            return;
          }


          if (error.status === 400) {

            this.enrollError =
              error.error?.message
              ?? 'Les informations saisies sont invalides.';

            return;
          }


          this.enrollError =
            error.error?.message
            ?? "Impossible d'inscrire l'eleve.";
        }

      });
  }


  enrollmentStatusLabel(
    status: string
  ): string {

    switch (status) {

      case 'PENDING':
        return 'En attente';

      case 'ACTIVE':
        return 'Active';

      case 'COMPLETED':
        return 'Terminee';

      case 'CANCELLED':
        return 'Annulee';

      case 'TRANSFERRED':
        return 'Transfert';

      default:
        return status || '-';
    }
  }
}