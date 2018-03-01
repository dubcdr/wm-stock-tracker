# WmStockTracker
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

The app can be viewed in Github pages [here](https://dubcdr.github.io/wm-stock-tracker/home)

## Notes: 

- I set the refresh interval on the home page to 10 seconds. I got some rate limiting warnings when I left the page up at 1 second refresh intervals.
- I used the Batch Stock Quotes Endpoint for the home page so that there were fewer api calls, which will be more performant. Unfortunately this endpoint only returns valid data while the stock market is open. I figured this was ok because it coincides with business hours. I could have also used combineLatest with RXJS and made a seperate call for each symbol.
- The CLI generated all the test files but I did not have time to write tests and they will fail since I didn't update the dependencies for them. I know that is one of the things you are looking for so I'd be happy to write some if you want.
- I do very little error checking. It seems that if the api receives an invalid stock symbol it just ignores it, so I kind of do the same.
- I made the home page cards so that if you click on the symbol it navigates to the history page. If you click on the price then it fetches yesterdays closing price and compares.
- I spent almost no time on styling, could definitely make that much better. 

## Assumptions: 

- For the history page I assume the api response has the stock information in reverse chronological order. I do no checking for this. 

## Development server

First you'll need to run an `npm install` after cloning the repo

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
