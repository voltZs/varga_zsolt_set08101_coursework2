var rantToggle = document.querySelector("#rantVentDesc");
var confessToggle = document.querySelector("#confessVentDesc");
var ridicToggle = document.querySelector("#ridicVentDesc");
var descriptor = document.querySelector("#ventDescriptor");

var initialText = descriptor.innerText;

var toggles = [rantToggle, confessToggle, ridicToggle];

rantToggle.addEventListener("mouseenter", function(){
  descriptor.innerText = "We associate the color red with rants. Use the RANT category when your venting is mainly anger driven."
})

confessToggle.addEventListener("mouseenter", function(){
  descriptor.innerText = "It's important to share things you're not proud of. Use the CONFESSION category when you want to clear your conscious a bit."
})

ridicToggle.addEventListener("mouseenter", function(){
  descriptor.innerText = "If you have a funny story you're not proud of, the RIDICULOUS category is the way to go."
})


for(var i =0; i<toggles.length; i++){
  toggles[i].addEventListener("mouseleave", function(){
    descriptor.innerText = initialText;
  })
}

console.log(window.innerHeight);
