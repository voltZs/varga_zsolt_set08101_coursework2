var sortSelection = document.getElementById("sortSelection");
var sortContainer = document.getElementById("sortContainer");

var newest= document.createElement("span");
var oldest = document.createElement("span");
var mostPop = document.createElement("span");

var newestLink= document.getElementById("newestSortLink");
var oldestLink = document.getElementById("oldestSortLink");
var mostPopLink = document.getElementById("mostPopSortLink");

newestLink.innerHTML = "<span class='hoverDark'> Newest </span>"
newest.appendChild(newestLink);
oldestLink.innerHTML = "<span class='hoverDark'> Oldest </span>"
oldest.appendChild(oldestLink);
mostPopLink.innerHTML = "<span class='hoverDark'> Most Popular </span>"
mostPop.appendChild(mostPopLink);

var sorts = [newest, oldest, mostPop];

var currentSort = index;

var enlarged = false;

sortSelection.innerHTML = "";
sortSelection.appendChild(sorts[currentSort]);

sortContainer.addEventListener("click", function(){
  if(enlarged){
    enlarged = false;
  } else{
    enlarged = true;
  }

  refreshSortDisplay();
});

function refreshSortDisplay(){
  if(enlarged){
    for(var i =0; i<sorts.length; i++){
      if(!(i==currentSort)){
        sortSelection.appendChild(sorts[i]);
      }
    }
  } else {
    sortSelection.innerHTML = "";
    sortSelection.appendChild(sorts[currentSort]);
  }
}
