import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,      // Директива для ссылок
        RouterLinkActive  // Директива для подсветки активной страницы
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
}
