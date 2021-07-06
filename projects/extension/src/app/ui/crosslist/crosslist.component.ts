import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crosslist',
  templateUrl: './crosslist.component.html',
  styleUrls: ['./crosslist.component.scss'],
})
export class CrosslistComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('Called Constructor');
    this.route.queryParams.subscribe((params) => {
      console.log('params are: ', params);
    });
  }
}
