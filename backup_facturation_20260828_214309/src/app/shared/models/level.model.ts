export interface Level {

  id: string;

  establishmentId: string;

  code: string;

  name: string;

  description: string | null;

  displayOrder: number | null;

  active: boolean;
}