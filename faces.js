function maketable(itemsPerRow,imgTitle,urlTitle) {
	var rows = Math.ceil(get_images(imgTitle, urlTitle).length / itemsPerRow);
    
	for (i=0;i<rows;i++) {
        $('table.gameboard').append('<tr class="gameboard" ></tr>');
    }
	
    for (i=0;i<itemsPerRow;i++) {
			$('tr.gameboard').append('<td class="gameboard" ><span class="name"></span><br/><img style="display:none;" /></td>');
    }
	
}


function reset_game(imgTitle,urlTitle) {
    $('span.winner').hide();
    $('span.refresh').hide();
	
    deal_images(imgTitle,urlTitle);
	
    randname("reset",imgTitle,urlTitle);            
    $('span.queryline').show();
}


// Randomize the names and faces and deal them into the table
function deal_images(imgTitle,urlTitle) {
	
    var nameList = get_images(imgTitle,urlTitle);	
    var span = $("span.name");
    var img = $("img");
    
    nameList = shuffle(nameList);
	
    for(i=0;i<nameList.length;i++){	
	
			span[i].innerHTML = nameList[i][0];
			$(span[i]).attr("tag", nameList[i][0]);
			$(span[i]).parent("td").attr("tag", nameList[i][0]);
			$(span[i]).parent("td").attr("guessed", false);
			
			img[i].src = nameList[i][1];
			$(img[i]).attr("tag", nameList[i][0]);
			
			if (format_switch() == "faces") {
				$(img[i]).css("display", "none");
				$(span[i]).css("display", "inline");
			}
			else {
				$(img[i]).css("display", "inline");
				$(span[i]).css("display", "none");
			}
    }   
	
	// shades in the empty boxes
	var totalBoxes = Math.ceil(get_images(imgTitle,urlTitle).length/5) * 5;
	
	
	for (i = get_images(imgTitle,urlTitle).length; i < totalBoxes+1; i++) {
		$(span[i]).parent("td").attr('bgcolor', '#d3d3d3');
	}
	            
}


var bufferColor;

function keypress(event) {
	var inc = 0;
	nRows = 4;
	nCols = 5;
	var currCell = keypress.currCell || 0;		
	
	t = $('td.gameboard');
	td = t[currCell];
	td.bgColor = bufferColor;
	
	key = event.which;
	if ((key==37) & (currCell % nCols > 0)) {
		// left
		inc = -1;
	} else if  ((key==38) & (currCell >= nCols)) {
		// up
		inc = -nCols;
	} else if  ((key==39) & (currCell % nCols < 3))  {
		// right
		inc = 1;
	} else if  ((key==40) & (currCell < nCols*nRows - nCols)) {
		// down
		inc = nCols;
	} else if (key==13) {
		// return key pressed. check the answer.
		check_answer(td.attr("tag"),imgTitle,urlTitle);
		return;
	} else {
		return;
	}

	if (inc > 0) {
		currCell += inc;
		if (currCell > nRows*nCols - 1) {
			currCell -= nRows*nCols;
		} else if (currCell < 0) {
			currCell += nRows*nCols;
		}

		keypress.currCell = currCell;
		td = t[keypress.currCell];
		bufferColor = td.bgColor;
		td.bgColor = "#FFC0C0";
	}
}


function check_answer(tag,imgTitle,urlTitle) {
	
	if (!timerRunning) {
        InitializeTimer();
    }
    var count = clickcounter();
    $('span.counter').html(count);
    
    var str;
    if (format_switch()=="faces") {
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
		updateProgress(get_images(imgTitle,urlTitle).length);
		
		//Correct Counter
		var correctCount = correctCounter();
    	$('span.correct').html(correctCount+"/"+(get_images(imgTitle,urlTitle).length));
		
		
        if ($('td[guessed=false]').length==0) {
            // You win!
            StopTheClock();
            $('span.queryline').hide();
            $('span.winner').fadeIn(100);
            $('span.refresh').fadeIn(2000);
        } else {
            // You still have more names to guess
            randname("next",imgTitle,urlTitle);
        }
        
    } else {
        // You guessed incorrectly
        choice.css("color","#FF0000");      
        choice.fadeOut(1000);
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


function clickcounter() {
    clickcounter.count = ++clickcounter.count || 1;
    return (clickcounter.count);
}


function correctCounter() {
    correctCounter.correctCount = ++correctCounter.correctCount || 1;
    return (correctCounter.correctCount);
}


function format_switch() {
    // return either "faces" or "names" depending on which game you want to play
    // input = "faces";
    var urlstr = window.location.href;
    var urlFirstSplit = urlstr.split('?');
	
	var urlparts = urlFirstSplit[1].split('&');
	
    if ((urlparts.length>0) && (urlparts[0]=="faces")) {
        return("faces");
    } else {
        return("names");
    }
}


function randname(option,imgTitle,urlTitle) {

    if (option=="reset") {
        randname.list = get_images(imgTitle,urlTitle);
        randname.list = shuffle(randname.list,imgTitle,urlTitle);
    }
    newname = randname.list.shift();
    if (newname!=undefined) {
        var q = $('div.query');
        $(q[0]).attr("tag",newname[0]);
		
		
		if (format_switch()=="faces") {
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
