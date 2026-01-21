import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWizardComponent } from './create-wizard.component';

describe('CreateWizardComponent', () => {
  let component: CreateWizardComponent;
  let fixture: ComponentFixture<CreateWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
