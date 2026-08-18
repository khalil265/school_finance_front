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
  FeeService
} from '../../core/services/fee.service';

import {
  AcademicYearService
} from '../../core/services/academic-year.service';

import {
  LevelService
} from '../../core/services/level.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AcademicYear
} from '../../shared/models/academic-year.model';

import {
  Level
} from '../../shared/models/level.model';

import {
  FeeStructure,
  FeeType
} from '../../shared/models/fee.model';


@Component({
  selector: 'app-fees',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './fees.component.html',
  styleUrl: './fees.component.css'
})
export class FeesComponent implements OnInit {

  private readonly feeService =
    inject(FeeService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly levelService =
    inject(LevelService);

  private readonly appContext =
    inject(AppContextService);

  private readonly fb =
    inject(FormBuilder);


  activeTab: 'types' | 'structures' = 'types';


  academicYears: AcademicYear[] = [];

  levels: Level[] = [];

  feeTypes: FeeType[] = [];

  feeStructures: FeeStructure[] = [];


  selectedAcademicYearId = '';

  selectedLevelId = '';


  typeFormVisible = false;

  structureFormVisible = false;


  loadingTypes = false;

  loadingStructures = false;

  loadingLevels = false;

  loadingYears = false;

  saving = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly typeForm =
    this.fb.nonNullable.group({

      code: [
        '',
        [
          Validators.required
        ]
      ],

      name: [
        '',
        [
          Validators.required
        ]
      ],

      category: [
        'TUITION',
        [
          Validators.required
        ]
      ],

      frequency: [
        'MONTHLY',
        [
          Validators.required
        ]
      ],

      description: [''],

      mandatory: [true]

    });


  readonly structureForm =
    this.fb.nonNullable.group({

      feeTypeId: [
        '',
        [
          Validators.required
        ]
      ],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      installmentCount: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      firstDueDate: [''],

      gracePeriodDays: [0]

    });


  ngOnInit(): void {

    this.loadAcademicYears();

    this.loadLevels();

    this.loadFeeTypes();
  }


  switchTab(
    tab: 'types' | 'structures'
  ): void {

    this.activeTab = tab;

    this.formError = '';

    this.successMessage = '';


    if (
      tab === 'structures' &&
      this.selectedAcademicYearId &&
      this.selectedLevelId
    ) {

      this.loadFeeStructures();
    }
  }


  loadAcademicYears(): void {

    this.loadingYears = true;


    this.academicYearService
      .findAll(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingYears = false;
        })
      )
      .subscribe({

        next: years => {

          this.academicYears = years;

          const current =
            years.find(y => y.currentYear);

          this.selectedAcademicYearId =
            current
              ? current.id
              : (years[0]?.id ?? '');
        },

        error: error => {

          console.error(
            'Erreur chargement annees academiques',
            error
          );

          this.errorMessage =
            'Impossible de charger les annees academiques.';
        }

      });
  }


  loadLevels(): void {

    this.loadingLevels = true;


    this.levelService
      .findAll(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingLevels = false;
        })
      )
      .subscribe({

        next: levels => {

          this.levels = levels;

          this.selectedLevelId =
            levels[0]?.id ?? '';
        },

        error: error => {

          console.error(
            'Erreur chargement niveaux',
            error
          );

          this.errorMessage =
            'Impossible de charger les niveaux.';
        }

      });
  }


  loadFeeTypes(): void {

    this.loadingTypes = true;

    this.errorMessage = '';


    this.feeService
      .getTypes(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingTypes = false;
        })
      )
      .subscribe({

        next: types => {

          this.feeTypes = types;
        },

        error: error => {

          console.error(
            'Erreur chargement types de frais',
            error
          );

          this.errorMessage =
            'Impossible de charger les types de frais.';
        }

      });
  }


  loadFeeStructures(): void {

    if (
      !this.selectedAcademicYearId ||
      !this.selectedLevelId
    ) {
      return;
    }


    this.loadingStructures = true;

    this.errorMessage = '';


    this.feeService
      .getStructures(
        this.appContext.establishmentId(),
        this.selectedAcademicYearId,
        this.selectedLevelId
      )
      .pipe(
        finalize(() => {
          this.loadingStructures = false;
        })
      )
      .subscribe({

        next: structures => {

          this.feeStructures = structures;
        },

        error: error => {

          console.error(
            'Erreur chargement structures de frais',
            error
          );

          this.errorMessage =
            'Impossible de charger les structures de frais.';
        }

      });
  }


  onFilterChange(): void {

    this.loadFeeStructures();
  }


  openTypeForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.typeForm.reset({

      code: '',

      name: '',

      category: 'TUITION',

      frequency: 'MONTHLY',

      description: '',

      mandatory: true

    });

    this.typeFormVisible = true;
  }


  closeTypeForm(): void {

    if (this.saving) {
      return;
    }

    this.typeFormVisible = false;

    this.formError = '';
  }


  submitType(): void {

    this.formError = '';


    if (this.typeForm.invalid) {

      this.typeForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.typeForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      category:
        value.category,

      frequency:
        value.frequency,

      description:
        this.nullIfEmpty(
          value.description
        ),

      mandatory:
        value.mandatory

    };


    this.feeService
      .createType(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: type => {

          this.successMessage =
            `Type de frais "${type.name}" cree avec succes.`;

          this.typeFormVisible = false;

          this.loadFeeTypes();
        },

        error: (error: HttpErrorResponse) => {

          this.handleSaveError(error);
        }

      });
  }


  openStructureForm(): void {

    if (
      !this.selectedAcademicYearId ||
      !this.selectedLevelId
    ) {

      this.formError =
        "Selectionnez une annee academique et un niveau.";

      return;
    }


    this.formError = '';

    this.successMessage = '';

    this.structureForm.reset({

      feeTypeId: '',

      amount: 0,

      installmentCount: 1,

      firstDueDate: '',

      gracePeriodDays: 0

    });

    this.structureFormVisible = true;
  }


  closeStructureForm(): void {

    if (this.saving) {
      return;
    }

    this.structureFormVisible = false;

    this.formError = '';
  }


  submitStructure(): void {

    this.formError = '';


    if (this.structureForm.invalid) {

      this.structureForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.structureForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      academicYearId:
        this.selectedAcademicYearId,

      levelId:
        this.selectedLevelId,

      feeTypeId:
        value.feeTypeId,

      amount:
        value.amount,

      installmentCount:
        value.installmentCount,

      firstDueDate:
        this.nullIfEmpty(
          value.firstDueDate
        ),

      gracePeriodDays:
        value.gracePeriodDays

    };


    this.feeService
      .createStructure(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: () => {

          this.successMessage =
            'Structure de frais creee avec succes.';

          this.structureFormVisible = false;

          this.loadFeeStructures();
        },

        error: (error: HttpErrorResponse) => {

          this.handleSaveError(error);
        }

      });
  }


  private handleSaveError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement',
      error
    );


    if (error.status === 409) {

      this.formError =
        error.error?.message
        ?? 'Cet element existe deja.';

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
      "Impossible d'enregistrer.";
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


  categoryLabel(
    category: string
  ): string {

    switch (category) {

      case 'REGISTRATION':
        return 'Inscription';

      case 'TUITION':
        return 'Scolarite';

      case 'CANTEEN':
        return 'Cantine';

      case 'TRANSPORT':
        return 'Transport';

      case 'EXAM':
        return 'Examen';

      case 'UNIFORM':
        return 'Uniforme';

      case 'BOOKS':
        return 'Livres';

      case 'ACTIVITY':
        return 'Activite';

      case 'OTHER':
        return 'Autre';

      default:
        return category || '-';
    }
  }


  frequencyLabel(
    frequency: string
  ): string {

    switch (frequency) {

      case 'ONE_TIME':
        return 'Unique';

      case 'MONTHLY':
        return 'Mensuel';

      case 'QUARTERLY':
        return 'Trimestriel';

      case 'SEMESTER':
        return 'Semestriel';

      case 'ANNUAL':
        return 'Annuel';

      default:
        return frequency || '-';
    }
  }
}