import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

interface GameCard {
  name: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected auth = inject(AuthService);

  games: GameCard[] = [
    {
      name: 'Ahorcado',
      description: 'Adiviná la palabra letra por letra antes de que sea tarde',
      icon: 'pi pi-exclamation-triangle',
      route: '/games/ahorcado',
      gradient: 'from-blue-500/20'
    },
    {
      name: 'Mayor o Menor',
      description: '¿La próxima carta será mayor o menor? ¡Ponete a prueba!',
      icon: 'pi pi-sort-alt',
      route: '/games/mayor-menor',
      gradient: 'from-purple-500/20'
    },
    {
      name: 'Preguntados',
      description: 'Respondé preguntas de distintas categorías y ganás puntos',
      icon: 'pi pi-question-circle',
      route: '/games/preguntados',
      gradient: 'from-orange-500/20'
    },
    {
      name: 'Wordle',
      description: 'Adiviná la palabra de 5 letras en 6 intentos',
      icon: 'pi pi-align-left',
      route: '/games/wordle',
      gradient: 'from-green-500/20'
    },
  ];
}