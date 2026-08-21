export interface SchoolClass {

  id: string;

  establishmentId: string;

  academicYearId: string;

  academicYear: string;

  levelId: string;

  level: string;

  code: string;

  name: string;

  capacity: number | null;

  active: boolean;
}