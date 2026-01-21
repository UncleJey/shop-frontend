import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ProductService} from '../core/services/product.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-create-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './create-wizard.component.html',
  styleUrl: './create-wizard.component.scss'
})
export class CreateWizardComponent {

  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  // Массивы для файлов и превью
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    });

    // Форма для второго шага (остается, чтобы визард работал)
    this.secondFormGroup = this._formBuilder.group({});
  }

  // АСИНХРОННАЯ ЗАГРУЗКА ФАЙЛОВ
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);

    // Проверка лимита: текущие + новые <= 10
    if (this.selectedFiles.length + newFiles.length > 10) {
      alert(`Можно загрузить не более 10 изображений. Выбрано: ${newFiles.length}, уже добавлено: ${this.selectedFiles.length}`);
      return;
    }

    // Добавляем файлы в общий массив
    this.selectedFiles.push(...newFiles);

    // Создаем промисы для чтения каждого файла
    const readerPromises = newFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    // Ждем, пока прочитаются ВСЕ файлы одновременно
    Promise.all(readerPromises).then(previews => {
      this.imagePreviews.push(...previews);
    });
  }

  // Удаление конкретного файла (опционально)
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  cancel(): void {
    // Проверяем, вносились ли изменения
    const hasChanges = this.firstFormGroup.dirty || this.selectedFiles.length > 0;

    if (hasChanges) {
      const confirmed = confirm('Вы уверены, что хотите выйти? Все несохраненные данные будут потеряны.');
      if (!confirmed) {
        return;
      }
    }

    // Перенаправляем на страницу моих товаров
    this.router.navigate(['/my-products']);
  }

  onSubmit() {
    if (this.firstFormGroup.invalid || this.selectedFiles.length === 0) {
      alert('Заполните все поля и выберите хотя бы одно изображение');
      return;
    }

    // Создаем FormData
    const formData = new FormData();
    formData.append('name', this.firstFormGroup.value.title);
    formData.append('price', this.firstFormGroup.value.price);
    formData.append('description', this.firstFormGroup.value.description);

    // Добавляем все файлы. ВАЖНО: Ключ должен быть один ('images' или 'files[]'),
    // а бэкенд должен ожидать массив файлов.
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.productService.createProduct(formData).subscribe(() => {
      alert('Товар создан!');
      this.router.navigate(['/my-products']);
    });
  }
}
