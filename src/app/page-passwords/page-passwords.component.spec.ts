import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePasswordsComponent } from './page-passwords.component';

describe('PagePasswordsComponent', () => {
  let component: PagePasswordsComponent;
  let fixture: ComponentFixture<PagePasswordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagePasswordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePasswordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
