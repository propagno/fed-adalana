import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DeliveryService, ScheduleConfiguration, OperatingHour } from '../../../core/services/delivery.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' }
];

@Component({
  selector: 'app-schedule-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    PageHeaderComponent
  ],
  templateUrl: './schedule-settings.component.html',
  styles: []
})
export class ScheduleSettingsComponent implements OnInit {
  scheduleForm: FormGroup;
  loading = false;
  saving = false;
  daysOfWeek = DAYS_OF_WEEK;
  accountId: string = '';

  constructor(
    private deliveryService: DeliveryService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.scheduleForm = this.fb.group({
      allowSameDayDelivery: [false],
      minLeadTimeMinutes: [60, [Validators.required, Validators.min(15)]],
      maxSchedulingDays: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
      operatingHours: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.accountId) {
      this.accountId = user.accountId;
      this.loadSchedule();
    }
  }

  get operatingHoursFormArray(): FormArray {
    return this.scheduleForm.get('operatingHours') as FormArray;
  }

  loadSchedule(): void {
    if (!this.accountId) return;
    this.loading = true;
    this.deliveryService.getScheduleConfiguration(this.accountId).subscribe({
      next: (config) => {
        // this.accountId = config.accountId; // Already set
        this.scheduleForm.patchValue({
          allowSameDayDelivery: config.allowSameDayDelivery,
          minLeadTimeMinutes: config.minLeadTimeMinutes,
          maxSchedulingDays: config.maxSchedulingDays
        });

        // Clear existing form array
        while (this.operatingHoursFormArray.length !== 0) {
          this.operatingHoursFormArray.removeAt(0);
        }

        // Populate with existing or default hours
        DAYS_OF_WEEK.forEach(day => {
          const existingHour = config.operatingHours?.find(h => h.dayOfWeek === day.value);
          this.operatingHoursFormArray.push(this.createOperatingHourFormGroup(
            day.value,
            existingHour?.openTime || '08:00',
            existingHour?.closeTime || '20:00',
            existingHour?.isOpen ?? true
          ));
        });

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading schedule configuration', err);
        this.toastService.error('Erro ao carregar configurações de horários');
        
        // Initialize with defaults
        DAYS_OF_WEEK.forEach(day => {
          this.operatingHoursFormArray.push(this.createOperatingHourFormGroup(
            day.value,
            '08:00',
            '20:00',
            day.value !== 'SUNDAY'
          ));
        });
        this.loading = false;
      }
    });
  }

  createOperatingHourFormGroup(dayOfWeek: string, openTime: string, closeTime: string, isOpen: boolean): FormGroup {
    return this.fb.group({
      dayOfWeek: [dayOfWeek],
      openTime: [openTime, Validators.required],
      closeTime: [closeTime, Validators.required],
      isOpen: [isOpen]
    });
  }

  getOperatingHourFormGroup(index: number): FormGroup {
    return this.operatingHoursFormArray.at(index) as FormGroup;
  }

  toggleDay(index: number): void {
    const formGroup = this.getOperatingHourFormGroup(index);
    const isOpen = formGroup.get('isOpen')?.value;
    formGroup.patchValue({ isOpen: !isOpen });
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.toastService.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.saving = true;
    const formValue = this.scheduleForm.value;

    const config: ScheduleConfiguration = {
      accountId: this.accountId,
      allowSameDayDelivery: formValue.allowSameDayDelivery,
      minLeadTimeMinutes: formValue.minLeadTimeMinutes,
      maxSchedulingDays: formValue.maxSchedulingDays,
      operatingHours: formValue.operatingHours.map((hour: any) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen
      }))
    };

    this.deliveryService.updateScheduleConfiguration(this.accountId, config).subscribe({
      next: () => {
        this.toastService.success('Configurações de horários salvas com sucesso!');
        this.saving = false;
      },
      error: (err: any) => {
        console.error('Error saving schedule configuration', err);
        this.toastService.error('Erro ao salvar configurações');
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    this.loadSchedule();
  }

  formatTimeLabel(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }
}

