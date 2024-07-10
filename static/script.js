//Get tickers from local storage
var tickers = JSON.parse(localStorage.getItem('tickers') ) || [];
var lastPrices = {};
var counter = 25;

function startupDateCycle(){
    upDatePrices();
    setInterval(function(){
        counter--;
        $("#counter").text(counter);
        if(counter <= 0){
            upDatePrices();
            counter = 25;
        }

    }, 1000)
}



//When page loads, get tickers from local storage
$(document).ready(function() {

    tickers.forEach(function(ticker) {
        addTickerToGrid(ticker);
    });

    upDatePrices();

    $("#add-ticker-form").submit(function(e){
        e.preventDefault();
        var newTicker = $("#new-ticker").val().toUpperCase();

        if(!tickers.includes(newTicker)){
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
        }
        $("#new-ticker").val("");
        upDatePrices();
    });

  //Remove Ticker
    $("#tickers-grid").on("click", ".remove-butn", function () {
        var tickerToRemove = $(this).data("ticker");
        tickers = tickers.filter(t=> t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();

    });

    startupDateCycle();
});



function addTickerToGrid(ticker){
    $("#tickers-grid").append(`
        <div id="${ticker}"
            class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price"></p>
            <p id="${ticker}-pct"></p>
            <button class="remove-butn" data-ticker="${ticker}">Remove</button>
        </div>
    `);
}

function upDatePrices(){
    tickers.forEach(function(ticker){
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({"ticker": ticker}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                console.log(data.currentPrice);
                console.log(data.openPrice);

                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                console.log(changePercent);

                var colorClass;
                if (changePercent <= -2){
                    colorClass = "dark-red";
                } else if (changePercent < 0){
                    colorClass = "red";
                } else if (changePercent == 0){
                    colorClass = "gray";
                } else if (changePercent <= 2){
                    colorClass = "green";
                } else {
                    colorClass = "dark-green";
                }

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`(${changePercent.toFixed(2)}%)`);
                $(`#${ticker}-price`).removeClass("dark-red red gray green dark-green").addClass(colorClass);
                $(`#${ticker}-pct`).removeClass("dark-red red gray green dark-green").addClass(colorClass);

                var flashClass;
                if(lastPrices[ticker] > data.currentPrice){
                    flashClass = "red-flash";

                } else if (lastPrices[ticker] <  data.currentPrice){
                    flashClass = "green-flash";
                } else {
                    flashClass = "gray-flash";
                }
                lastPrices[ticker] = data.currentPrice;

                $(`${ticker}`).addClass(flashClass);

                setTimeout(function(){
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);

                
            }
        });
    });

}




