import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductService } from '../core/services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './create-wizard.component.html',
  styleUrl: './create-wizard.component.scss'
})
export class CreateWizardComponent {

  isLinear = true; // Шаги должны идти по порядку
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    // Первый шаг: Основное
    this.firstFormGroup = this._formBuilder.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    });

    // Второй шаг: Картинки (для примера просто URL)
    this.secondFormGroup = this._formBuilder.group({
      imageUrl: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
      const product = {
        name: this.firstFormGroup.value.title,
        price: this.firstFormGroup.value.price,
        description: this.firstFormGroup.value.description,
        images: [this.secondFormGroup.value.imageUrl] // Массив картинок
      };

      this.productService.createProduct(product).subscribe(() => {
        alert('Товар создан!');
        this.router.navigate(['/my-products']); // Редирект на "Мои товары"
      });
    }
  }
}
