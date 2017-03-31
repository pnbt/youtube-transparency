import $ from 'jquery';
import './js/helpers';

$(document).ready(function() {
   let jsonLocal = {};
   $.get('https://jsonblob.com/api/e1e7fb29-125b-11e7-a0ba-17d4fd61f6e6', function(data) {
      jsonLocal = data;
      console.log(data);
      Object.keys(data).forEach((key, index) => {
         $('#sidebar').append(
            `
            <a class="panel-block panel-event ${index === 0 ? 'is-active' : ''}">
               <span class="panel-img">
                  <img class="circular--square" src="http://placehold.it/150x150" alt=""/>
               </span> 
               <span id="panel-key">${key}</span>
            </a>
            `,
         );
      });
      appendVideo(Object.keys(data)[0]);
   });

   $(document).on('click', '.panel-event', function(event) {
      const key = $(this).children('#panel-key').text();
      appendVideo(key);
   });

   // $('#selectTheme').change((event) => {
   //    appendVideo(event.target.value);
   // });

   // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key) {
      $('.videos').empty();
      jsonLocal[key].filter((item) => item.likes !== -1 && item.depth < 4).forEach((item, index) => {
         $('.videos').append(
            `
            <div class="box">
            <article class="media">
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
                     <a href="https://www.youtube.com/watch?v=${item.id}"><strong>${item.title}</strong></a><br>
                     <span class="tag ${item.title.toLowerCase().latinise().includes(key.split(' ').pop().toLowerCase().latinise()) ? 'is-success' : 'is-primary'}">Suggéré ${item.recommendations} fois</span>  <small>${item.views} vues - ${item.likes} likes - ${item.dislikes} unlikes</small><br>
                     </p>
                  </div>
               </div>
               </article></div>

         `,
         );
      });
   }
});
