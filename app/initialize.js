import $ from 'jquery';
import './js/helpers';

$(document).ready(function() {
   let jsonLocal = {};
   let jsonThemeLocal = {};
   $.get('data/themes.json', function(data) {
      Object.keys(data).forEach((key) => {
         data[key].forEach((item) => {
            jsonThemeLocal[item.tag] = item;
            $('#sidebar').append(
               `
            <a class="panel-event" id="panel-block-${item.tag
                  .split(' ')
                  .pop()}" data-key="${item.tag}">
               <span class="panel-img">
                  <img class="circular--square" src="${item.picture}" alt=""/>
               </span>
            </a>
            `,
            );
         });
      });
   });
   $.get(
      'https://jsonblob.com/api/e1e7fb29-125b-11e7-a0ba-17d4fd61f6e6',
      function(data) {
         jsonLocal = data;
         appendVideo(Object.keys(data)[0]);
         appendPresentation(Object.keys(data)[0]);
      },
   );

   $(document).on('click', '.panel-event', function() {
      const key = $(this).data('key');
      appendPresentation(key);
      appendVideo(key);
   });

   function appendPresentation(key) {
      $('#presentation').empty();
      $('#presentation').append(
         `
         <div class="columns">
            <div class="column is-8 is-offset-2 has-text-centered">
                  <img class="circular--square is-block" src="${jsonThemeLocal[key].picture}" alt=""/>
                  <h1 class="title" id="presentation-title">Vidéos les plus suggérées par YouTube</h1><br>
                  <h2 class="subtitle">dans la liste de lecture à droite à partir de la recherche "<a href="https://www.youtube.com/results?search_query=${key}">${key}</a>"</h2>
            </div>
         </div>
         `,
      );
   }

   // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key) {
      $('#sidebar').children().each(function() {
         $(this).removeClass('is-active');
      });
      $('#panel-block-' + key.split(' ').pop()).addClass('is-active');
      $('.videos').empty();
      jsonLocal[key]
         .filter((item) => item.likes !== -1)
         .forEach((item, index) => {
            if (index > 19) return;
            $('.videos').append(
               `
            <div class="box">
            <article class="media">
               <figure class="media-left level">
                  <small class="level-item">${index + 1}</small>
                  <a href="https://www.youtube.com/watch?v=${item.id}">
                     <div class="is-inline-block level-item">
                        <img class="image" width="170px" src="https://img.youtube.com/vi/${item.id}/hqdefault.jpg">
                     </div>
                  </a>
               </figure>
               <div class="media-content">
                  <div class="content">
                     <p>
                     <a href="https://www.youtube.com/watch?v=${item.id}"><strong class="video-title">${item.title}</strong></a><br>
                  <small>${item.views} vues &nbsp; &nbsp;<i class="fa fa-thumbs-up" aria-hidden="true"></i>${item.likes}  <i class="fa fa-thumbs-down" aria-hidden="true"></i>${item.dislikes}</small><br>
                     </p>
                  </div>
               </div>
               </article></div>

         `,
            );
         });
   }
});
