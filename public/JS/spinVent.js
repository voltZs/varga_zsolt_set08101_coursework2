var scrollPos;
var mainContainer;
var contentHeight;
var visibleHeight;
var relScrollPos;

var spinningVent = document.getElementById("movingVent");

var angle = 0 ;


console.log(relScrollPos);

window.addEventListener("scroll", function(){
  var scrollPos = window.scrollY;
  var mainContainer = document.querySelector(".mainContainer")
  var contentHeight = mainContainer.offsetHeight;
  var visibleHeight = window.innerHeight;
  var relScrollPos = scrollPos / (contentHeight-visibleHeight);

  angle= scrollPos * -1;
  spinningVent.style.transform = "rotate(" + angle + "deg)";
})
