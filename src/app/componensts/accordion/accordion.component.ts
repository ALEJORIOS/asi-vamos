import { Component, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent {

  constructor(private renderer: Renderer2) {}

  @HostListener('click', ['$event.target'])
  onClick(target: any) {
    if(target.classList.contains("title")) {
      if(target.parentElement.children[1].classList.contains("show")) {
        this.renderer.removeClass(target.parentElement.children[1], "show");
      }else{
        this.renderer.addClass(target.parentElement.children[1], "show");
      }
    }
  }
}
