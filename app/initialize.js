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
   let url = getUrlVar('file') || 'ytrecos-presidentielle-2017-04-08';
   if (getUrlVar('file')) {
      $('#video-select').children().each(function() {
         if ($(this)[0].value === getUrlVar('file')) $(this)[0].selected = true;
      });
   }
   $.get('data/ytrecos-presidentielle/' + url + '.json', function(data) {
      jsonLocal = data;
      let count = 0;
      Object.keys(jsonLocal).forEach((item) => {
         count += jsonLocal[item].length;
      });
      $('#nb_video').append(count);
      let random = Math.floor(Math.random() * Object.keys(jsonLocal).length);
      let key = getUrlVar('candidat') || Object.keys(data)[random];
      appendVideo(key);
      appendPresentation(key);
      changeUrlParam('file', url);
   });

   $(document).on('click', '.panel-event', function() {
      const key = $(this).data('key');
      appendPresentation(key);
      appendVideo(key);
   });

   $(document).on('change', '#video-select', function(event) {
      $.get(
         'data/ytrecos-presidentielle/' + event.target.value + '.json',
         (data) => {
            url = event.target.value;
            jsonLocal = data;
            let count = 0;
            changeUrlParam('file', event.target.value);
            Object.keys(jsonLocal).forEach((item) => {
               count += jsonLocal[item].length;
            });
            $('#nb_video').empty();
            $('#nb_video').append(count);
            appendVideo($('#selected-key').text());
         },
      );
   });

   function appendPresentation(key) {
      $('#presentation').empty();
      $('#presentation').append(
         `
         <div class="columns">
            <div class="column is-8 is-offset-2 has-text-centered">
                  <img class="circular--square is-block" src="${jsonThemeLocal[key].picture}" alt=""/>
                  <h1 class="title" id="presentation-title">Vidéos les plus suggérées par YouTube</h1><br>
                  <h2 class="subtitle">dans la liste de lecture à droite à partir de la recherche "<a href="https://www.youtube.com/results?search_query=${key}" target="_blank"><span id="selected-key">${key}</span></a>"</h2>
            </div>
         </div>
         `,
      );
   }

   // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key) {
      changeUrlParam('candidat', key);
      changeUrlParam('file', url);
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
                  <a href="https://www.youtube.com/watch?v=${item.id}" target="_blank">
                     <div class="is-inline-block level-item">
                        <img class="image" width="170px" src="https://img.youtube.com/vi/${item.id}/hqdefault.jpg">
                     </div>
                  </a>
               </figure>
               <div class="media-content">
                  <div class="content">
                     <p>
                     <a href="https://www.youtube.com/watch?v=${item.id}" target="_blank"><strong class="video-title">${item.title}</strong></a><br>
                  <small>${item.views} vues &nbsp; &nbsp;<i class="fa fa-thumbs-up" aria-hidden="true"></i>${item.likes}  <i class="fa fa-thumbs-down" aria-hidden="true"></i>${item.dislikes}</small><br>
                     </p>
                  </div>
               </div>
               </article></div>

         `,
            );
         });
   }

   // SLIDER
   if (localStorage.getItem('introDone') === 'yes') {
      $('#intro').hide();
   }
   $(document).on('click', '.hideIntro', function() {
      if (currentIndex > slidesLength - 1) {
         $('#intro').hide();
         localStorage.setItem('introDone', 'yes');
      }
   });
   $(document).on('click', '.showIntro', function() {
      $('#intro').show();
      currentIndex = 0;
      cycleSlides(currentIndex);
      markDots(currentIndex + 1);            
      $('.btn__next').html('Suivant');
      $('.btn__next').removeClass('hideIntro');
      localStorage.setItem('introDone', 'no');
   });
   //basic variables for slide information
   var currentIndex = 0, //first slide
      slides = $('.slide'),
      slidesLength = slides.length; //how many slides
   $('.btn__prev').hide(); //hide previous button
   createDots(slidesLength); //funtion for creating pagination dots
   function cycleSlides(current) {
      //function which handles slide traversing
      var slide = $('.slide').eq(current);
      slides.hide();
      slide.show();
   }
   function markDots(position) {
      //function to add active class to active dot
      $('.paginationDot').removeClass('paginationDot--active');
      $('.paginationDot:nth-child(' + position + ')').addClass(
         'paginationDot--active',
      );
   }
   markDots(1); //add active class to the first dot
   cycleSlides(currentIndex);
   $('.btn__next').on('click', function() {
      //function for 'next' button
      $('.btn__prev').show(); //show the previous button
      currentIndex += 1; //increment the value of current slide
      cycleSlides(currentIndex); //call slide handle function
      if (currentIndex > slidesLength - 2) {
         //if it second to last slide show 'done' instead of 'next'
         $('.btn__next').html('Découvrir !');
         $('.btn__next').addClass('hideIntro');
         // $('.btn__next').attr('disabled', true);
      } else {
         $('.btn__next').attr('disabled', false);
      }
      cycleSlides(currentIndex);
      markDots(currentIndex + 1);
   });
   $('.btn__prev').on('click', function() {
      //function for previous slide
      $('.btn__next').attr('disabled', false);
      currentIndex -= 1;
      if (currentIndex <= 0) {
         $('.btn__prev').hide();
      }
      $('.btn__next').html('Suivant');
      $('.btn__next').removeClass('hideIntro');
      cycleSlides(currentIndex);
      markDots(currentIndex + 1);
   });
});

function getURLParameter(name) {
   return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
         location.search,
      ) || [, ''])[1]
         .replace(/\+/g, '%20'),
   ) || null;
}

function createDots(length) {
   //function to create pagination dots
   for (let i = 0; i <= length - 1; i++) {
      $('.pagination').append('<div class="paginationDot"></div>');
   }
}

function changeUrlParam(param, value) {
   const currentURL = window.location.href + '&';
   const change = new RegExp('(' + param + ')=(.*)&', 'g');
   const newURL = currentURL.replace(change, '$1=' + value + '&');

   if (getURLParameter(param) !== null) {
      try {
         window.history.replaceState('', '', newURL.slice(0, -1));
      } catch (err) {
         console.err(err);
      }
   } else {
      const currURL = window.location.href;
      if (currURL.indexOf('?') !== -1) {
         window.history.replaceState(
            '',
            '',
            currentURL.slice(0, -1) + '&' + param + '=' + value,
         );
      } else {
         window.history.replaceState(
            '',
            '',
            currentURL.slice(0, -1) + '?' + param + '=' + value,
         );
      }
   }
}
function getUrlVar(key) {
   const result = new RegExp(key + '=([^&]*)', 'i').exec(
      window.location.search,
   );
   return (result && unescape(result[1])) || '';
}
