import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../stock.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService
  ) { }

  ngOnInit() {
    const symbol = this.route.snapshot.queryParamMap.get('symbol');
    if (!_.isNil(symbol))
  }

}
