import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockService } from '../stock.service';
import * as _ from 'lodash';
import { IStock } from '../stock';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  public days: IStock[];
  public symbol: string;

  private unsubscribe = new Subject<null>();

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService
  ) { }

  ngOnInit() {
    this.symbol = this.route.snapshot.queryParamMap.get('symbol').toUpperCase();
    if (!_.isNil(this.symbol)) {
      this.stockService.getStockHistory(this.symbol)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(resp => this.days = resp);
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
