import $ from "jquery";

$(document).ready(function () {
   $.get("data/data.json", function (data) {
      Object.keys(data).forEach((key)=>{
         // console.log(data[key]);
         data[key].forEach((item)=>{
            console.log(item);
            $('.videos').append(`<div class="video">${item.title}</div>`)
         })
      })
   });
});

