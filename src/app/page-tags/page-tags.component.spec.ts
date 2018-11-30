import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTagsComponent } from './page-tags.component';

describe('PageTagsComponent', () => {
  let component: PageTagsComponent;
  let fixture: ComponentFixture<PageTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
