import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AppContextService {

  private readonly ESTABLISHMENT_KEY =
    'school_finance_establishment_id';


  private readonly DEFAULT_ESTABLISHMENT_ID =
    '149ed9f9-129e-4c17-9006-fb99790e0caa';


  private readonly platformId =
    inject(PLATFORM_ID);


  private readonly browser =
    isPlatformBrowser(
      this.platformId
    );


  readonly establishmentId =
    signal<string>(
      this.loadEstablishment()
    );


  setEstablishment(
    id: string
  ): void {

    if (this.browser) {

      localStorage.setItem(
        this.ESTABLISHMENT_KEY,
        id
      );
    }


    this.establishmentId.set(id);
  }


  private loadEstablishment(): string {

    if (!this.browser) {

      return this.DEFAULT_ESTABLISHMENT_ID;
    }


    return (
      localStorage.getItem(
        this.ESTABLISHMENT_KEY
      )
      ??
      this.DEFAULT_ESTABLISHMENT_ID
    );
  }
}