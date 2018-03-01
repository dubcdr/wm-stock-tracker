import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { IStock } from './stock';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as moment from 'moment';
import { interval } from 'rxjs/observable/interval';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

interface IApiStock {
  '1. symbol': string;
  '2. price': string;
  '3. volume': string;
  '4. timestamp': string;
}

interface IApiResponse {
  'Meta Data': { [key: string]: string };
  'Stock Quotes': IApiStock[];
}

@Injectable()
export class StockService implements OnDestroy {
  private key = 'wm-stocks';
  public stocks: BehaviorSubject<IStock[]> = new BehaviorSubject<IStock[]>([{ symbol: 'WMT' }]);

  private readonly stockApiBaseUrl = 'https://www.alphavantage.co/query?';
  private readonly apiKey = 'D75OOOSE3ORB6HC1';
  private readonly interval = 10000;


  private readonly radix = 10;

  private unsubscribe = new Subject<void>();

  constructor(private http: HttpClient) {
    this.getStocks();
    interval(this.interval).subscribe(() => {
      this.getStocks();
    });
  }

  public getStockHistory(str: string): Observable<IStock[]> {
    // https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&outputsize=full&apikey=demo

    const url = `${this.stockApiBaseUrl}function=TIME_SERIES_DAILY&symbol=${str}&outputsize=30&apikey=${this.apiKey}`;
    return this.http.get(url).pipe(map((resp: IApiResponse) => {
      return this.parseStocks(resp);
    }));
  }

  private getStocks() {
    if (this.atLeastOneStock()) {
      const stockString = this.stocks.getValue().map((stock) => {
        return stock.symbol;
      }).join(',');
      const url = `${this.stockApiBaseUrl}function=BATCH_STOCK_QUOTES&symbols=${stockString}&apikey=${this.apiKey}`;
      this.http.get(url)
        .subscribe((resp: IApiResponse) => {
          this.stocks.next(this.parseStocks(resp));
        });
    }
  }

  private parseStocks(resp: IApiResponse): IStock[] {
    return resp['Stock Quotes'].map((quote) => {
      return this.parseStock(quote);
    });
  }

  private parseStock(json: IApiStock): IStock {
    return {
      symbol: json['1. symbol'],
      price: parseFloat(json['2. price']),
      date: moment(json['4. timestamp']).toDate()
    };
  }

  public addStock(stock: string): void {
    const current = this.stocks.getValue();
    current.push({ symbol: stock });
    this.stocks.next(current);
    this.getStocks();
  }

  public removeStock(stock: string): void {
    const current = this.stocks.getValue();
    _.remove(current, { symbol: stock });
    this.getStocks();
  }

  private atLeastOneStock(): boolean {
    const current = this.stocks.getValue();
    if (_.isNil(current) || current.length === 0) {
      return false;
    }
    return true;
  }

  public ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
