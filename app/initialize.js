import $ from "jquery";

$(document).ready(function () {
   let jsonLocal = {};
   $.get("data/data.json", function (data) {
      jsonLocal = data;
      Object.keys(data).forEach((key) => {
         $('#selectTheme').append(`<option>${key}</option>`)
      });
      appendVideo($('#selectTheme option').first().text())
   });

   $('#selectTheme').change((e) => {
      appendVideo(e.target.value)
   });

   // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key) {
      $('.videos').empty();
      jsonLocal[key].filter((item)=> item.likes !== -1).forEach((item) => {
         $('.videos').append(
            `<article class="media">
               <figure class="media-left">
               <a href="https://www.youtube.com/watch?v=${item.id}">
                  <p class="image is-128x128">
                     <img src="https://img.youtube.com/vi/${item.id}/default.jpg">
                  </p>
               </a>
               </figure>
               <div class="media-content">
                  <div class="content">
                     <p>
                     <a href="https://www.youtube.com/watch?v=${item.id}"><strong>${item.title}</strong></a> <small>${item.views} vues</small><br>
                     <span class="tag is-primary">${item.recommendations} recommandations</span><br><br> 
                     ${item.likes} <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
                     ${item.dislikes} <i class="fa fa-thumbs-o-down" aria-hidden="true"></i>
                     
                     </p>
                  </div>
               </div>
               <div class="media-right">
               </div>
               </article>
         
         `);
      })
   }

});



