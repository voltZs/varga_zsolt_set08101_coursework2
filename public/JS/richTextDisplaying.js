var displayDivQuillList = document.getElementsByClassName("displayDivQuill");

var displays = [];

for(var i = 0; i<displayDivQuillList.length; i++){
  displays.push(new Quill(displayDivQuillList[i], {
    modules: {
      toolbar: false
    },
    readOnly: true,
    theme: 'snow'}
  ));
}

for(var i =0; i<displays.length; i++){
  displays[i].setContents(JSON.parse(displayConts[i]));
}
