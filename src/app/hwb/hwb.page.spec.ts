import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HwbPage } from './hwb.page';

describe('HwbPage', () => {
  let component: HwbPage;
  let fixture: ComponentFixture<HwbPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HwbPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HwbPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
