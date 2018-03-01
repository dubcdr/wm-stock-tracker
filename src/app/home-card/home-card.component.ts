import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, EventEmitter, Output } from '@angular/core';
import { IStock } from '../stock';
import { StockService } from '../stock.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.scss']
})
export class HomeCardComponent implements OnChanges {
  @Input()
  public stock: IStock;

  @Output()
  public delete: EventEmitter<string> = new EventEmitter<string>();

  public yesterday: IStock;

  public showChange = false;

  public percentageChange: number;
  public valueChange: number;

  constructor(private stockService: StockService) { }

  public ngOnChanges(changes) {
    if (!_.isNil(this.yesterday)) {
      this.calculateChange();
    }
  }

  toggle() {
    if (_.isNil(this.yesterday)) {
      this.stockService.getStockHistory(this.stock.symbol).pipe(take(1)).subscribe((stocks) => {
        this.yesterday = _.find(stocks, ((stock) => {
          return moment().subtract(1, 'd').isSame(moment(stock.date), 'd');
        }));
        this.calculateChange();
      });
    }
    this.showChange = !this.showChange;
  }

  private calculateChange(): void {
    this.setPercentageChange();
    this.setValueChange();
  }

  private setPercentageChange(): void {
    this.percentageChange = (this.stock.price / this.yesterday.close) - 1;
  }

  private setValueChange(): void {
    this.valueChange = this.stock.price - this.yesterday.close;
  }

  public removeStock() {
    this.delete.emit(this.stock.symbol);
  }

}
