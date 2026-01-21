import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Добавим тип FormGroup для лучшей типизации
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';

// Определяем интерфейс для данных формы для лучшей типобезопасности
interface ProductFormValue {
    name: string | null;
    category: string | null;
    description: string | null;
}

@Component({
    selector: 'app-add-product-wizard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './add-product-wizard.component.html',
    styleUrls: ['./add-product-wizard.component.css']
})
export class AddProductWizardComponent {
    step = 1;
    // Явно указываем тип FormGroup<ProductFormValue> для формы
    form: FormGroup<any> = this.fb.group<ProductFormValue>({
        name: ['', Validators.required],
        category: ['', Validators.required],
        description: ['']
    });

    files: File[] = [];
    previews: string[] = [];
    uploading = false;
    result: any = null;

    constructor(private fb: FormBuilder, private svc: ProductService) {
    }

    next() {
        // Проверка this.step === 1 && this.form.get('name')?.invalid уже корректна.
        if (this.step === 1 && this.form.get('name')?.invalid) return;
        this.step = Math.min(4, this.step + 1);
    }

    back() {
        this.step = Math.max(1, this.step - 1);
    }

    onFilesSelected(ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (!input.files) return;
        this.files = Array.from(input.files);
        this.previews = [];
        this.files.forEach(f => {
            const reader = new FileReader();
            // Используем стрелочную функцию и приведение типов, как и было
            reader.onload = () => this.previews.push(reader.result as string);
            reader.readAsDataURL(f);
        });
    }

    submit() {
        if (this.form.invalid) {
            this.step = 1;
            // Можно добавить this.form.markAllAsTouched() здесь, чтобы показать ошибки пользователю
            // this.form.markAllAsTouched();
            return;
        }
        this.uploading = true;
        const fd = new FormData();

        // Используем оператор ?? '' (nullish coalescing) для обработки потенциальных null/undefined значений,
        // хотя для строгих форм это обычно не требуется, это делает код безопаснее.
        fd.append('name', this.form.value.name ?? '');
        fd.append('category', this.form.value.category ?? '');
        fd.append('description', this.form.value.description ?? '');
        this.files.forEach((f, i) => fd.append('photos', f, f.name));

        this.svc.create(fd).subscribe({
            next: res => {
                this.result = res;
                this.step = 4;
                this.uploading = false;
            },
            error: err => {
                console.error(err);
                this.uploading = false;
            }
        });
    }

    reset() {
        this.form.reset();
        this.files = [];
        this.previews = [];
        this.step = 1;
        this.result = null;
    }
}
