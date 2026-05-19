import { Component, inject, OnInit } from '@angular/core';
import { GithubService } from '../../core/services/github';


@Component({
  selector: 'app-who-am-i',
  imports: [],
  templateUrl: './who-am-i.html',
  styleUrl: './who-am-i.css',
})

export class WhoAmI implements OnInit {
  githubService = inject(GithubService);

  ngOnInit(): void {
    this.githubService.loadProfile();
  }
}
