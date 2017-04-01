import $ from 'jquery';
import './js/helpers';

$(document).ready(function() {
   let jsonLocal = {};
   $.get('https://jsonblob.com/api/e1e7fb29-125b-11e7-a0ba-17d4fd61f6e6', function(data) {
      jsonLocal = data;
      Object.keys(data).forEach((key) => {
         $('#sidebar').append(
            `
            <a class="panel-block panel-event" id="panel-block-${key.split(' ').pop()}">
               <span class="panel-img">
                  <img class="circular--square" src="http://placehold.it/150x150" alt=""/>
               </span> 
               <span id="panel-key">${key}</span>
            </a>
            `,
         );
      });
      appendVideo(Object.keys(data)[0], 4);
      appendPresentation(Object.keys(data)[0]);
   });

   $(document).on('click', '.panel-event', function() {
      const key = $(this).children('#panel-key').text();
      appendPresentation(key);
      appendVideo(key, $('#depth').val());
   });

   $('#depth').on('change', (event) => {
      appendVideo($('#presentation-title').text(), event.target.value);
   });

   function appendPresentation(key) {
      $('#presentation').empty();
      $('#presentation').append(
         `
         <div class="columns">
            <div class="column is-2">
               <img class="circular--square level-item" src="http://placehold.it/150x150" alt=""/>
            </div>
            <div class="column is-10">
                  <h1 class="title" id="presentation-title">${key}</h1><br>
                  <h2 class="subtitle">Top 20 des vidéos les plus sugérées par Youtube.</h2>
            </div>
         </div>
         `,
      );
   }

   // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key, depth) {
      [].forEach.call($('.panel-block'), (item) => {
         $(item).removeClass('is-active');
      });
      $('#panel-block-' + key.split(' ').pop()).addClass('is-active');
      $('.videos').empty();
      jsonLocal[key].filter((item) => item.likes !== -1 && item.depth >= depth).forEach((item, index) => {
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
                     <a href="https://www.youtube.com/watch?v=${item.id}"><strong class="video-title">${item.title}</strong></a><br>
                     <span class="tag ${item.title.toLowerCase().latinise().includes(key.split(' ').pop().toLowerCase().latinise()) ? 'is-success' : 'is-primary'}">Suggéré ${item.recommendations} fois</span> <small>${item.views} vues - ${item.likes} likes - ${item.dislikes} unlikes</small><br>
                     </p>
                  </div>
               </div>
               </article></div>

         `,
         );
      });
   }
});
