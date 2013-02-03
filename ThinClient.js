/** Everyone says that we should detect browsers not by detecting browsers but by detecting objects.
    So I went with the only technology I could think of AJAX, plus we had some code lying around
    It detects if the browser is doing AJAX the IE way or the other way. and returns if the browser is IE or not.
 */
function browserAJAX() {
  if (window.ActiveXObject){
    return "IE";
  }
  else if (window.XMLHttpRequest){
    return "Not IE";
  }
}

// This is decidedly not how you determine if something is mobile or not, as I learned when I tested it on my phone.
function screenSize() {
  if (screen.height <= 800 && screen.width <= 600){
    var screenSize = "mobile";
  } else {
    var screenSize = "normal";
  }
}

// This function loads the files of the not-thin Client
function addFile(filename, filetype){
//if filename is a external JavaScript file create a script element and add the js file.
 if (filetype == "js"){ 
  var element = document.createElement('script');
  element.setAttribute("type","text/javascript");
  element.setAttribute("src", filename);
 }
 //if filename is an external CSS file create a link element and load a stylesheet.
 else if (filetype == "css"){ 
  var element = document.createElement("link");
  element.setAttribute("rel", "stylesheet");
  element.setAttribute("type", "text/css");
  element.setAttribute("href", filename);
 }
}

// Loads the not-thin client
function loadClient(browser, screenSize){
switch (browser){
case IE:
    addFile("IE.js", "js");
  break;
default:
    addFile("firefox.js", "js");
}

switch (screenSize){
case mobile:
    addFile("mobile.css", "css");
    break;
default:
    addFile("maxwell.css", "css");
    }
}