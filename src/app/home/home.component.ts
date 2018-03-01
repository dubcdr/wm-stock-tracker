import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StockService } from '../stock.service';
import { IStock } from '../stock';
import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public stocks: IStock[];
  public addSymStr: string;
  public unsubscribe = new Subject<null>();

  constructor(
    private stockService: StockService,
  ) { }

  ngOnInit() {
    this.stockService.stocks
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((stocks) => {
        this.stocks = stocks;
      });
  }

  addStock() {
    if (!_.isNil(this.addSymStr) && this.addSymStr !== '') {
      this.stockService.addStock(this.addSymStr);
      this.addSymStr = '';
    }
  }

  removeStock(str: string) {
    this.stockService.removeStock(str);
  }

  trackByFn(index, item: IStock) {
    return item.symbol;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
