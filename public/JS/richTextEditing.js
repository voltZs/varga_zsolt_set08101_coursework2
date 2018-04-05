
var editorArea = document.querySelector('#editorDivQuill');

var editor = new Quill(editorArea, {
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      ['link', 'image']
    ]
  },
  placeholder: 'Just let it out...',
  theme: 'snow'
});

if(typeof content !== 'undefined'){
  editor.setContents(JSON.parse(content));
}

var ventForm = document.querySelector('#ventForm');
if(ventForm){
  ventForm.onsubmit = function(){
    var content = document.querySelector('input[name=content]');
    content.value = JSON.stringify(editor.getContents());
  }
}

var groupForm = document.querySelector('#groupForm');
if(groupForm){
  groupForm.onsubmit = function(){
    var description = document.querySelector('input[name=description]');
    description.value = JSON.stringify(editor.getContents());
  }
}
