import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { IStock } from './stock';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { interval } from 'rxjs/observable/interval';
import { map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

interface IIntradayApiStock {
  '1. symbol': string;
  '2. price': string;
  '3. volume': string;
  '4. timestamp': string;
}

interface IIntradayResponse {
  'Meta Data': { [key: string]: string };
  'Stock Quotes': IIntradayApiStock[];
}

interface IDailyResponse {
  'Meta Data': { [key: string]: string };
  'Time Series (Daily)': { [key: string]: IDailyInfoResponse };
}

interface IDailyInfoResponse {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
  date?: string;
  symbol?: string;
}

@Injectable()
export class StockService implements OnDestroy {
  private key = 'wm-stocks';
  public stocks: BehaviorSubject<IStock[]> = new BehaviorSubject<IStock[]>([{ symbol: 'WMT' }]);

  private readonly stockApiBaseUrl = 'https://www.alphavantage.co/query?';
  private readonly apiKey = 'D75OOOSE3ORB6HC1';
  private readonly interval = 10000;

  private readonly radix = 10;
  private readonly tz = 'America/New_York';

  private unsubscribe = new Subject<void>();

  constructor(private http: HttpClient) {
    this.getStocks();
    interval(this.interval)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.getStocks();
      });
  }

  /**
   *    HISTORY
   */
  public getStockHistory(str: string): Observable<IStock[]> {
    const url = `${this.stockApiBaseUrl}function=TIME_SERIES_DAILY&symbol=${str}&outputsize=compact&apikey=${this.apiKey}`;
    return this.http.get(url).pipe(map((resp: IDailyResponse) => {
      return this.transformHistoryObjToArr(resp, str);
    }));
  }

  private transformHistoryObjToArr(resp: IDailyResponse, symbol: string): IStock[] {
    const series = resp['Time Series (Daily)'];
    return _.keys(series).map((key) => {
      return _.assign(series[key], { date: key, symbol });
    }).slice(0, 30).map((info) => {
      return this.parseDailyInfo(info);
    });
  }

  private parseDailyInfo(info: IDailyInfoResponse): IStock {
    return {
      symbol: info.symbol,
      date: moment.tz(info.date, this.tz).toDate(),
      close: parseFloat(info['4. close']),
      high: parseFloat(info['2. high']),
      low: parseFloat(info['3. low']),
      open: parseFloat(info['1. open'])
    };
  }

  /**
   *  BATCH INTRADAY
   */

  private getStocks() {
    if (this.atLeastOneStock()) {
      const stockString = this.stocks.getValue().map((stock) => {
        return stock.symbol;
      }).join(',');
      const url = `${this.stockApiBaseUrl}function=BATCH_STOCK_QUOTES&symbols=${stockString}&apikey=${this.apiKey}`;
      this.http.get(url)
        .subscribe((resp: IIntradayResponse) => {
          this.stocks.next(this.parseIntradayStocks(resp));
        });
    }
  }

  private parseIntradayStocks(resp: IIntradayResponse): IStock[] {
    return resp['Stock Quotes'].map((quote) => {
      return this.parseIntradayStock(quote);
    });
  }

  private parseIntradayStock(json: IIntradayApiStock): IStock {
    return {
      symbol: json['1. symbol'],
      price: parseFloat(json['2. price']),
      date: moment.tz(json['4. timestamp'], this.tz).toDate()
    };
  }

  public addStock(stock: string): void {
    if (!this.isSymbolPresent(stock)) {
      const current = this.stocks.getValue();
      current.push({ symbol: stock });
      this.stocks.next(current);
      this.getStocks();
    }
  }

  private isSymbolPresent(symbol: string): boolean {
    return _.some(this.stocks.getValue(), { symbol });
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
