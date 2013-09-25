var numRows;
var numCols;
var numItems;
var currCell;
var bufferColor;
var nameList;
var gameType;
var clickCount;
var correctCount;

function maketable(itemsPerRow,imgTitle,urlTitle) {
	numRows = Math.ceil(imgTitle.length / itemsPerRow);
	numCols = itemsPerRow;
    
	for (i=0; i<numRows; i++) {
        $('table.gameboard').append('<tr class="gameboard" ></tr>');
    }
    for (i=0; i<numCols; i++) {
    	$('tr.gameboard').append('<td class="gameboard" ><span class="name"></span><br/><img style="display:none;" /></td>');
    }
}

function reset_game(imgTitle,urlTitle) {
    $('span.winner').hide();
    $('span.refresh').hide();

	clickCount = correctCount = 0;
	
    // parse game type
    try {
    	gameType = window.location.href.split('?')[1].split('&')[0];
    }
    catch (err) {
    	gameType = 'faces'
    }

    // shuffle and deal names
    nameList = [];
	for (var i = 1; i < imgTitle.length; i++)
	{
        nameList.push([imgTitle[i],urlTitle[i]]);
	}
    numItems = nameList.length;
    nameList = shuffle(nameList);
    deal_images();
	nameList = shuffle(nameList);
    randname();

    $('span.queryline').show();
}

// Randomize the names and faces and deal them into the table
function deal_images() {
    var span = $("span.name");
    var img = $("img");
	
    for(i=0;i<numItems;i++){
		span[i].innerHTML = nameList[i][0];
		$(span[i]).attr("tag", nameList[i][0]);
		$(span[i]).parent("td").attr("tag", nameList[i][0]);
		$(span[i]).parent("td").attr("guessed", false);
		
		img[i].src = nameList[i][1];
		$(img[i]).attr("tag", nameList[i][0]);
		
		if (gameType == "faces") {
			$(img[i]).css("display", "none");
			$(span[i]).css("display", "inline");
		}
		else {
			$(img[i]).css("display", "inline");
			$(span[i]).css("display", "none");
		}
    }   
	
	for (i = numItems; i < numRows * numCols; i++) {
		$(span[i]).parent("td").attr('bgcolor', '#d3d3d3');
	}
	            
}

function keypress(event) {
	t = $('td.gameboard');
	td = t[currCell || 0];
	if (currCell == null) {
		currCell = 0;
	}
	else
	{
		td.bgColor = bufferColor;
		var currRow = Math.floor(currCell / numCols);
		var currCol = currCell % numCols;


		key = event.which;
		if (key==37) { // left
			currCell = currCell - 1;
			if (Math.floor(currCell / numCols) < currRow)
				currCell = Math.min(currCell + numCols, numItems - 1);
		} else if  (key==38) { // up
			currCell = currCell - numCols;
			if (currCell < 0)
				currCell = Math.floor((numItems - currCol - 1) / numCols) * numCols + currCol;
		} else if  (key==39) { // right
			currCell = currCell + 1;
			if (Math.floor(currCell / numCols) > currRow || currCell >= numItems)
				currCell = currCell - currCol - 1;
		} else if  (key==40) { // down
			currCell = currCell + numCols;
			if (currCell >= numItems)
				currCell = currCol;
		} else if (key==13) { // return key
			td.bgColor = "#FFC0C0";
			check_answer(td.getAttribute("tag"));
			return;
		} else {
			return;
		}
	}
	td = t[currCell];
	bufferColor = td.bgColor;
	td.bgColor = "#FFC0C0";
}


function check_answer(tag) {
	
	if (!timerRunning) {
        InitializeTimer();
    }
    ++clickCount;
    $('span.counter').html(clickCount);
    
    var str;
    if (gameType=="faces") {
        str = 'img[tag="' + tag + '"]';
    } else {
        str = 'span.name[tag="' + tag + '"]';
    }
    choice = $(str);
    choice.fadeIn(500);
	
	
    if ($('div.query').attr('tag') == $(choice).attr('tag')) {
        // You guessed correctly
        choice.css("color","#000000");
        choice.parent('td').css('background-color','#F0F0D0');
        choice.parent('td').attr('guessed',true);
        
		//Progress Bar
		updateProgress(numItems);
		
		//Correct Counter
		correctCount = ++correctCount || 1;
    	$('span.correct').html(correctCount+"/"+(numItems));
		
		
        if ($('td[guessed=false]').length==0) {
            // You win!
            StopTheClock();
            $('span.queryline').hide();
            $('span.winner').fadeIn(100);
            $('span.refresh').fadeIn(2000);
        } else {
            // You still have more names to guess
            randname();
        }
		return true;
        
    } else {
        // You guessed incorrectly
        choice.css("color","#FF0000");      
        choice.fadeOut(1000);
		return false;
    }
}


function updateProgress(imgLength) {
  var progress;
  progress = $('div.selector')
    .progressbar("option","value");
  if (progress < 100) {
      $('div.selector')
        .progressbar("option", "value", progress + (100/imgLength));
  }
}

function randname() {
    newname = nameList.shift();
    if (newname!=undefined) {
        var q = $('div.query');
        $(q[0]).attr("tag",newname[0]);
		
		
		if (gameType=="faces") {
            $(q[0]).html('<img src="' + newname[1] + '" />');
        } else {
            $(q[0]).html(newname[0]);
        }
    }
}


function shuffle(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}


// The next three functions are related to the timer
var secs;
var timerID = null;
var timerRunning = false;
var delay = 1000;

function InitializeTimer()
{
    // Set the length of the timer, in seconds
    secs = -1;
    StopTheClock();
    StartTheTimer();
}


function StopTheClock()
{
    if (timerRunning)
        clearTimeout(timerID);
    timerRunning = false;
}


function StartTheTimer()
{
    self.status = secs;
    secs = secs + 1;
    $('span.timer').html(secs);
    timerRunning = true;
    timerID = self.setTimeout("StartTheTimer()", delay);
}