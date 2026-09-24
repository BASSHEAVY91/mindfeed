import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-black text-brand-800 mb-1">✉️ Contáctanos</h1>
      <p class="text-gray-500 mb-8">¿Tienes una pregunta, sugerencia o quieres enviarnos una noticia? Escríbenos.</p>

      @if (sent()) {
        <div class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8 animate-fade-in">
          <div class="text-4xl mb-2">✅</div>
          <h2 class="text-lg font-bold text-green-700 mb-1">¡Mensaje enviado exitosamente!</h2>
          <p class="text-green-600 text-sm">Te responderemos en menos de 24 horas.</p>
          <button (click)="reset()"
            class="mt-4 px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
            Enviar otro mensaje
          </button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <!-- NAME + EMAIL -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nombre completo *</label>
              <input formControlName="name" type="text" placeholder="Ej: Ana García"
                class="w-full px-3 py-2 text-sm border rounded-xl outline-none transition-colors
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                [class.border-red-400]="isInvalid('name')"
                [class.border-gray-200]="!isInvalid('name')" />
              @if (isInvalid('name')) {
                <p class="text-xs text-red-500 mt-1">⚠ El nombre es obligatorio</p>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Correo electrónico *</label>
              <input formControlName="email" type="email" placeholder="correo@ejemplo.com"
                class="w-full px-3 py-2 text-sm border rounded-xl outline-none transition-colors
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                [class.border-red-400]="isInvalid('email')"
                [class.border-gray-200]="!isInvalid('email')" />
              @if (isInvalid('email')) {
                <p class="text-xs text-red-500 mt-1">⚠ Ingresa un correo válido</p>
              }
            </div>
          </div>

          <!-- SUBJECT + PHONE -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Asunto</label>
              <select formControlName="subject"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white">
                <option value="consulta">Consulta general</option>
                <option value="noticia">Enviar noticia</option>
                <option value="colaboracion">Colaboración</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Teléfono (opcional)</label>
              <input formControlName="phone" type="tel" placeholder="+57 300 000 0000"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>

          <!-- MESSAGE -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Mensaje *</label>
            <textarea formControlName="message" rows="5" placeholder="Escribe tu mensaje aquí..."
              class="w-full px-3 py-2 text-sm border rounded-xl outline-none transition-colors resize-none
                focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              [class.border-red-400]="isInvalid('message')"
              [class.border-gray-200]="!isInvalid('message')"></textarea>
            @if (isInvalid('message')) {
              <p class="text-xs text-red-500 mt-1">⚠ El mensaje es obligatorio (mínimo 10 caracteres)</p>
            }
          </div>

          <!-- SUBMIT -->
          <button type="submit"
            class="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="submitting()">
            {{ submitting() ? 'Enviando...' : 'Enviar mensaje →' }}
          </button>
        </form>
      }

      <!-- INFO CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div class="bg-brand-50 rounded-2xl p-4 flex items-start gap-3">
          <span class="text-2xl">📧</span>
          <div>
            <p class="text-xs font-bold text-brand-800">Email</p>
            <p class="text-sm text-gray-600">info&#64;mindfeed.app</p>
          </div>
        </div>
        <div class="bg-brand-50 rounded-2xl p-4 flex items-start gap-3">
          <span class="text-2xl">⏱</span>
          <div>
            <p class="text-xs font-bold text-brand-800">Tiempo de respuesta</p>
            <p class="text-sm text-gray-600">Menos de 24 horas</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactComponent {
  form: FormGroup;
  sent = signal(false);
  submitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['consulta'],
      phone: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    // Simulate async send
    setTimeout(() => {
      this.submitting.set(false);
      this.sent.set(true);
    }, 900);
  }

  reset(): void {
    this.form.reset({ subject: 'consulta' });
    this.sent.set(false);
  }
}
