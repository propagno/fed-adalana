import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Company } from '../../../core/services/catalog.service';
import { DeliveryService, ScheduleConfiguration, OperatingHour } from '../../../core/services/delivery.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../../shared/components/progress/progress-indicator.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';

@Component({
  selector: 'app-cart-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule, MarketplaceNavbarComponent, ProgressIndicatorComponent, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Progress Indicator -->
        <div class="mb-8">
          <app-progress-indicator 
            [steps]="progressSteps"
            [currentStep]="'scheduling'">
          </app-progress-indicator>
        </div>
        
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="flex items-center justify-between mb-4">
            <app-button
              variant="ghost"
              size="md"
              label="Voltar"
              (clicked)="goBack()"
              ariaLabel="Voltar">
            </app-button>
            <div class="flex items-center justify-center gap-1 flex-1">
              <div class="relative">
                <span class="text-display font-display text-primary-light">A</span>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-display font-display text-primary">dalan</span>
                <span class="text-display font-display text-secondary">A</span>
              </div>
            </div>
            <div class="w-20"></div>
          </div>
          <h1 class="text-h1 md:text-display font-display text-primary mb-2">Agendar Entrega</h1>
          <p class="text-body-lg text-gray-600">Selecione a data e horário de entrega</p>
        </div>

        <!-- Company Information Card -->
        <app-card *ngIf="company" [elevation]="1" padding="md" customClass="mb-6 bg-white">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex-1">
              <h3 class="text-lg md:text-h3 font-semibold text-gray-900 mb-1">{{ company.company_name }}</h3>
              <p *ngIf="company.category" class="text-body-sm text-gray-600 mb-1">{{ company.category }}</p>
              <div *ngIf="company.phone" class="flex items-center gap-2 text-body-sm text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{{ company.phone }}</span>
              </div>
              <div *ngIf="company.address" class="flex items-start gap-2 text-body-sm text-gray-600 mt-1">
                <span class="flex-1">{{ company.address }}</span>
              </div>
            </div>
          </div>
        </app-card>

        <app-card [elevation]="3" padding="lg" customClass="bg-white">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Loading State -->
            <div *ngIf="loading" class="text-center py-8">
              <p class="text-body text-gray-600">Carregando configurações de agendamento...</p>
            </div>

            <!-- Delivery Date -->
            <div *ngIf="!loading">
              <label class="block text-body-sm font-medium text-primary mb-2">
                Data de Entrega *
              </label>
              <input type="date" 
                     [(ngModel)]="deliveryDate"
                     [min]="minDate"
                     [max]="maxDate"
                     (change)="onDateChange()"
                     name="deliveryDate"
                     required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent bg-white text-primary">
              <p *ngIf="scheduleConfig && scheduleConfig.maxSchedulingDays" class="text-body-sm text-gray-600 mt-1">
                Você pode agendar até {{ scheduleConfig.maxSchedulingDays }} dias à frente
              </p>
              <p *ngIf="scheduleConfig && scheduleConfig.allowSameDayDelivery" class="text-body-sm text-primary mt-1">
                ✓ Entrega no mesmo dia disponível
              </p>
            </div>

            <!-- Delivery Time -->
            <div *ngIf="!loading && deliveryDate">
              <label class="block text-body-sm font-medium text-primary mb-2">
                Horário de Entrega *
              </label>
              <select [(ngModel)]="deliveryTime"
                      name="deliveryTime"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent bg-white text-primary"
                      [disabled]="availableTimeSlots.length === 0">
                <option value="">Selecione um horário</option>
                <option *ngFor="let slot of availableTimeSlots" 
                        [value]="slot.value" 
                        [disabled]="slot.disabled">
                  {{ slot.label }}
                </option>
              </select>
              
              <!-- Feedback Messages -->
              <p *ngIf="unavailableReason" class="text-body-sm text-error mt-2 font-medium">
                {{ unavailableReason }}
              </p>
              
              <p *ngIf="!unavailableReason && scheduleConfig && scheduleConfig.allowSameDayDelivery && deliveryDate === minDate" class="text-body-sm text-primary mt-1">
                Entrega no mesmo dia disponível
              </p>
            </div>

            <app-card *ngIf="error" variant="highlighted" [elevation]="0" padding="md" customClass="border-l-4 border-error bg-error/10">
              <p class="text-error font-semibold">{{ error }}</p>
            </app-card>

            <!-- Actions -->
            <div class="flex gap-4 pt-4">
              <app-button 
                variant="ghost"
                size="lg"
                label="Voltar"
                [fullWidth]="true"
                (clicked)="goBack()"
                ariaLabel="Voltar">
              </app-button>
              <app-button 
                variant="primary"
                size="lg"
                label="Continuar para Checkout"
                [fullWidth]="true"
                [disabled]="!deliveryDate || !deliveryTime || loading"
                (clicked)="onSubmit()"
                ariaLabel="Continuar para checkout">
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class CartSchedulingComponent implements OnInit {
  accountId: string | null = null;
  deliveryDate: string = '';
  deliveryTime: string = '';
  minDate: string = '';
  maxDate: string = '';
  error: string | null = null;
  company: Company | null = null;
  scheduleConfig: ScheduleConfiguration | null = null;
  availableTimeSlots: { value: string; label: string; disabled: boolean }[] = [];
  loading: boolean = false;
  unavailableReason: string | null = null; // New property for feedback
  
  progressSteps: ProgressStep[] = [
    { id: 'review', label: 'Revisar', completed: true },
    { id: 'scheduling', label: 'Agendar', completed: true },
    { id: 'checkout', label: 'Finalizar', completed: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'];
      if (this.accountId) {
        this.loadCompany();
        this.loadScheduleConfiguration();
      }
    });
  }

  loadCompany(): void {
    if (!this.accountId) return;
    
    this.catalogService.getCompanyById(this.accountId).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: (err: any) => {
        console.error('Error loading company', err);
      }
    });
  }

  loadScheduleConfiguration(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.deliveryService.getScheduleConfigurationPublic(this.accountId).subscribe({
      next: (config) => {
        console.log('✅ Schedule config loaded:', config);
        console.log('✅ Operating hours:', config.operatingHours);
        console.log('✅ Operating hours type:', Array.isArray(config.operatingHours));
        this.scheduleConfig = config;
        this.updateDateConstraints();
        this.updateTimeSlots();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error loading schedule configuration', err);
        console.error('❌ Error details:', JSON.stringify(err, null, 2));
        // Use default configuration if error
        this.scheduleConfig = {
          accountId: this.accountId!,
          allowSameDayDelivery: false,
          minLeadTimeMinutes: 60,
          maxSchedulingDays: 30,
          operatingHours: []
        };
        this.updateDateConstraints();
        this.updateTimeSlots();
        this.loading = false;
      }
    });
  }

  updateDateConstraints(): void {
    if (!this.scheduleConfig) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set max date based on maxSchedulingDays
    if (this.scheduleConfig.maxSchedulingDays) {
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + this.scheduleConfig.maxSchedulingDays);
      this.maxDate = maxDate.toISOString().split('T')[0];
    }
  }

  updateTimeSlots(): void {
    console.log('🔄 updateTimeSlots called');
    console.log('   scheduleConfig:', this.scheduleConfig);
    console.log('   deliveryDate:', this.deliveryDate);
    
    this.unavailableReason = null; // Reset reason
    
    if (!this.scheduleConfig || !this.deliveryDate) {
      console.log('⚠️ Missing scheduleConfig or deliveryDate');
      this.availableTimeSlots = [];
      return;
    }

    console.log('   operatingHours:', this.scheduleConfig.operatingHours);
    console.log('   operatingHours is array?', Array.isArray(this.scheduleConfig.operatingHours));
    
    // Validate operatingHours exists and is an array
    if (!this.scheduleConfig.operatingHours || !Array.isArray(this.scheduleConfig.operatingHours)) {
      console.log('❌ operatingHours validation failed!');
      this.availableTimeSlots = [];
      this.unavailableReason = 'Configuração de horários não disponível.';
      return;
    }
    
    console.log('✅ operatingHours validated, count:', this.scheduleConfig.operatingHours.length);

    // Handle date parsing correctly (local timezone)
    const dateParts = this.deliveryDate.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
    const day = parseInt(dateParts[2], 10);
    
    const selectedDate = new Date(year, month, day);
    const dayOfWeek = this.getDayOfWeekName(selectedDate.getDay());
    
    // Find operating hours for the selected day
    const dayHours = this.scheduleConfig.operatingHours.find(
      oh => oh.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!dayHours || !dayHours.isOpen) {
      this.availableTimeSlots = [];
      this.unavailableReason = 'Loja fechada neste dia da semana.';
      return;
    }

    // Generate time slots based on operating hours
    const slots: { value: string; label: string; disabled: boolean }[] = [];
    
    if (dayHours.openTime && dayHours.closeTime) {
      const openTime = this.parseTime(dayHours.openTime);
      const closeTime = this.parseTime(dayHours.closeTime);
      
      // Check if selected date is today
      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = selectedDate.getTime() === todayOnly.getTime();
      
      // Calculate minimum available time (current time + lead time if same day)
      let minAvailableTime: Date | null = null;
      
      if (isToday) {
        if (!this.scheduleConfig.allowSameDayDelivery) {
          this.availableTimeSlots = [];
          this.unavailableReason = 'Esta loja não realiza entregas no mesmo dia.';
          return;
        }
        
        const now = new Date();
        
        // Calculate Lead Time logic
        if (this.scheduleConfig.minLeadTimeMinutes && this.scheduleConfig.minLeadTimeMinutes > 0) {
          // Current time + lead time
          minAvailableTime = new Date(now.getTime() + this.scheduleConfig.minLeadTimeMinutes * 60000);
        } else {
          // Just current time if no lead time specified
          minAvailableTime = new Date(now);
        }

        // Check "Cutoff Time" (Deadline)
        // Determine closing time as a Date object for today
        const closingDate = new Date(today);
        closingDate.setHours(closeTime.hours, closeTime.minutes, 0, 0);

        // If the minimum possible delivery time is AFTER the store closes, today is impossible.
        if (minAvailableTime > closingDate) {
           this.availableTimeSlots = [];
           this.unavailableReason = `O horário limite para pedidos hoje já passou (requer ${this.scheduleConfig.minLeadTimeMinutes}min de preparo). Tente agendar para amanhã.`;
           return;
        }
      }
      
      // Generate slots in 2-hour intervals
      let currentTime = new Date(selectedDate);
      currentTime.setHours(openTime.hours, openTime.minutes, 0, 0);
      
      const endTime = new Date(selectedDate);
      endTime.setHours(closeTime.hours, closeTime.minutes, 0, 0);
      
      // If same day and we have a minimum time, start checking slots from opening time
      // We will simply disable or filter out slots before the minAvailableTime
      
      while (currentTime < endTime) {
        const slotStart = new Date(currentTime);
        let slotEnd = new Date(currentTime);
        slotEnd.setHours(slotEnd.getHours() + 2);
        
        // CLAMP LOGIC: If slot ends after closing time, clamp it to closing time.
        if (slotEnd > endTime) {
            slotEnd = new Date(endTime);
        }

        // Validate duration (e.g. avoid 0-minute slots)
        if (slotEnd > slotStart) {
            let displayStart = new Date(slotStart);
            let isValidSlot = true;

            // "ASAP" LOGIC for Today
            if (isToday && minAvailableTime) {
                const minTime = minAvailableTime.getTime();
                const sEnd = slotEnd.getTime();
                
                // If the entire slot is in the past (ends before we can be ready) -> Discard
                if (sEnd <= minTime) {
                    isValidSlot = false;
                } else {
                    // If the slot starts before we are ready (but ends after),
                    // adjust the start time to 'minAvailableTime' (ASAP)
                    if (displayStart.getTime() < minTime) {
                        displayStart = new Date(minAvailableTime);
                        
                        // Optional: Round up to next 10 mins for cleaner times
                        const remainder = displayStart.getMinutes() % 10;
                        if (remainder !== 0) {
                             displayStart.setMinutes(displayStart.getMinutes() + (10 - remainder));
                             displayStart.setSeconds(0);
                        }
                        // Re-check if rounding pushed us past end
                        if (displayStart >= slotEnd) {
                            isValidSlot = false;
                        }
                    }
                }
            }

            if (isValidSlot) {
                const startStr = this.formatTime(displayStart);
                const endStr = this.formatTime(slotEnd);
                
                // Only add if we have at least a small window (e.g. 15 mins)
                const durationMs = slotEnd.getTime() - displayStart.getTime();
                const durationMins = durationMs / 60000;
                
                if (durationMins >= 15) { 
                     slots.push({
                        value: `${startStr}-${endStr}`,
                        label: `${startStr} - ${endStr}`,
                        disabled: false
                     });
                }
            }
        }
        
        currentTime.setHours(currentTime.getHours() + 2);
      }
    }

    this.availableTimeSlots = slots;
    
    if (this.availableTimeSlots.length === 0 && !this.unavailableReason) {
        this.unavailableReason = 'Não há horários disponíveis para esta data.';
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getDayOfWeekName(dayIndex: number): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[dayIndex];
  }

  parseTime(timeStr: string): { hours: number; minutes: number } {
    const parts = timeStr.split(':');
    return {
      hours: parseInt(parts[0], 10),
      minutes: parseInt(parts[1] || '0', 10)
    };
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onDateChange(): void {
    this.updateTimeSlots();
    this.deliveryTime = ''; // Reset time when date changes
    // If there's a reason why slots are unavailable (e.g. closed today or past cutoff), error will be handled by template via unavailableReason
    this.error = null; 
  }

  onSubmit(): void {
    if (!this.deliveryDate || !this.deliveryTime) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.error = null;

    // Validate date is not in the past (compare only dates, not times)
    const selectedDateObj = new Date(this.deliveryDate + 'T00:00:00');
    const todayObj = new Date();
    
    // Compare dates only (year, month, day) - normalize to avoid timezone issues
    const selectedYear = selectedDateObj.getFullYear();
    const selectedMonth = selectedDateObj.getMonth();
    const selectedDay = selectedDateObj.getDate();
    
    const todayYear = todayObj.getFullYear();
    const todayMonth = todayObj.getMonth();
    const todayDay = todayObj.getDate();
    
    // Check if date is in the past
    if (selectedYear < todayYear || 
        (selectedYear === todayYear && selectedMonth < todayMonth) ||
        (selectedYear === todayYear && selectedMonth === todayMonth && selectedDay < todayDay)) {
      this.error = 'A data de entrega não pode ser no passado';
      return;
    }

    const isToday = selectedYear === todayYear && selectedMonth === todayMonth && selectedDay === todayDay;

    // Validate same-day delivery if applicable
    if (this.scheduleConfig && isToday) {
      if (!this.scheduleConfig.allowSameDayDelivery) {
        this.error = 'Entrega no mesmo dia não está disponível para esta loja';
        return;
      }
      
      // Check lead time
      if (this.scheduleConfig.minLeadTimeMinutes) {
        const now = new Date();
        const minDeliveryTime = new Date(now.getTime() + this.scheduleConfig.minLeadTimeMinutes * 60000);
        const timeParts = this.deliveryTime.split('-');
        if (timeParts.length > 0) {
          const selectedDateTime = new Date(this.deliveryDate + 'T' + timeParts[0] + ':00');
          
          if (selectedDateTime < minDeliveryTime) {
            this.error = `O pedido requer pelo menos ${this.scheduleConfig.minLeadTimeMinutes} minutos de tempo de preparo`;
            return;
          }
        }
      }
    }

    // Validate max scheduling days
    if (this.scheduleConfig && this.scheduleConfig.maxSchedulingDays) {
      const maxDate = new Date(todayYear, todayMonth, todayDay);
      maxDate.setDate(maxDate.getDate() + this.scheduleConfig.maxSchedulingDays);
      
      const selectedDateOnly = new Date(selectedYear, selectedMonth, selectedDay);
      
      if (selectedDateOnly > maxDate) {
        this.error = `A entrega não pode ser agendada com mais de ${this.scheduleConfig.maxSchedulingDays} dias de antecedência`;
        return;
      }
    }

    // Store in sessionStorage
    sessionStorage.setItem('deliveryDate', this.deliveryDate);
    sessionStorage.setItem('deliveryTime', this.deliveryTime);

    // Navigate to checkout
    this.router.navigate(['/catalog/cart-checkout'], { 
      queryParams: { accountId: this.accountId } 
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/cart-review'], { 
      queryParams: { accountId: this.accountId } 
    });
  }
}
