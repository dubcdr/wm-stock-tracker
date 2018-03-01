import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StockService } from '../stock.service';
import { IStock } from '../stock';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public stocks: IStock[];
  public addSymStr: string;

  constructor(
    private stockService: StockService,
  ) { }

  ngOnInit() {
    this.stockService.stocks.subscribe((stocks) => {
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

}
