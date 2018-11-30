import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSettingsComponent } from './page-settings.component';

describe('PageSettingsComponent', () => {
  let component: PageSettingsComponent;
  let fixture: ComponentFixture<PageSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
