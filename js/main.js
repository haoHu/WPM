$(window).load(function(){
  setup();
});

var API_BASE = "http://api.wordnik.com:80/v4/"
var words = [];
var index = 0;
var changeRate = 500;
var lastChanged = new Date();

// BMP stuff
var lastPress = -1;
var changeInterval;
var $body;

function setup(){
  getWords();
  $(document).mousedown( mouseDown );

  changeInterval = setInterval( draw, changeRate );

  $body = $('body'); //Cache this for performance

  var setBodyScale = function() {
      var scaleSource = $body.width(),
          scaleFactor = 0.35,                     
          maxScale = 600,
          minScale = 30; //Tweak these values to taste

      var fontSize = scaleSource * scaleFactor; //Multiply the width of the body by the scaling factor:

      if (fontSize > maxScale) fontSize = maxScale;
      if (fontSize < minScale) fontSize = minScale; //Enforce the minimum and maximums

      $body.css('font-size', fontSize + '%');
  }

  $(window).resize(function(){
      setBodyScale();
  });
}

function mouseDown(){
  var now = new Date();
  if ( lastPress != -1 || (now - lastPress) > 5000 ){
    changeRate = now - lastPress;
    console.log( changeRate );

    clearInterval( changeInterval );
    changeInterval = setInterval( draw, changeRate );
    $body.css("transition", "background-color ease-in-out " + changeRate/1000 +"s");
  }
  lastPress = now;
}

function draw(){
  var t = new Date();

  if ( words.length > 0 ){

    $body.css("backgroundColor", "rgb(" + Math.floor(Math.random() * 255) + "," + + Math.floor(Math.random() * 255) +"," + + Math.floor(Math.random() * 255) +")");
    lastChanged = t;
    var w = words[index];
    index++;

    $("#word").html(w);

    if ( index > words.length ){
      index = 0;
      if ( words.length < 100 )
        getWords();
    }
  }
}

function getRandomURL( minLength, maxLength, limit ){
  minLength = minLength !== undefined ? minLength : -1;
  maxLength = maxLength !== undefined ? maxLength : -1;
  return API_BASE + "words.json/randomWords?hasDictionaryDef=true&excludePartOfSpeech=given-name,family-name,proper-noun,proper-noun-plural&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=" + minLength + "&maxLength=" + maxLength +"&limit=" + limit + "&api_key=" + API_KEY;
}

function getHyphenateURL( word ){
  return API_BASE + "word.json/" + word + "/hyphenation?useCanonical=false&limit=10&api_key=" + API_KEY;
}

var gettingWords = false;

function getWords(){
  if ( gettingWords ) return;
  gettingWords = true;
  $.ajax({
    url: getRandomURL(-1,-1,100)
  }).success(gotWords);
}

// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function gotWords( data ){
  console.log( data, data.length, typeof data );
  console.log( "got worlds");
  data = shuffle(data);
  gettingWords = false;

  // get all syllables. am i gonna get busted for this?
  var numToGet = data.length;
  for ( var i=0; i<numToGet; i++){
    $.ajax({
      url: getHyphenateURL(data[i].word)
    }).success(function(d){
      if ( d.length > 0 ){
        for ( var j=0; j<d.length; j++){
          words.push( d[j].text + ( j + 1 < d.length ? "-" : "") );
        }
        words.push("");
      }
    });
  }
}

function ofMap(value, inputMin, inputMax, outputMin, outputMax, clamp) {
  var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);

  if( clamp ){
    if(outputMax < outputMin){
      if( outVal < outputMax )outVal = outputMax;
      else if( outVal > outputMin )outVal = outputMin;
    }else{
      if( outVal > outputMax )outVal = outputMax;
      else if( outVal < outputMin )outVal = outputMin;
    }
  }
  return outVal;
}