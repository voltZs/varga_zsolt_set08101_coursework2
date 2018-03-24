var sortSelection = document.getElementById("sortSelection");
var sortContainer = document.getElementById("sortContainer");

var newest = document.createElement("span");
var oldest = document.createElement("span");
var mostPop = document.createElement("span");
newest.innerHTML = "<span> Newest </span>";
oldest.innerHTML = "<span> Oldest </span>"
mostPop.innerHTML = "<span> Most Popular </span>"

var sorts = [newest, oldest, mostPop];
var currentSort = 0;

var enlarged = false;

sortSelection.innerHTML = "";
sortSelection.appendChild(sorts[currentSort]);

sortContainer.addEventListener("click", function(){
  if(enlarged){
    enlarged = false;
  } else(
    enlarged = true
  )

  refreshSortDisplay();
});

for(var i=0; i<sorts.length; i++){
  sorts[i].addEventListener("click", function(){
    if(enlarged){
      currentSort = sorts.indexOf(this);
      sortSelection.innerHTML = sorts[i];
    }
  })
}

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
