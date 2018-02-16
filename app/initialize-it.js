import $ from 'jquery';
import './js/helpers';

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

$(document).ready(function() {
  $.get("../data/*", function(data) 
  {
      console.log(data);
  });

  let jsonLocal = {};
   const jsonThemeLocal = {};
   const lastDate = 'ytrecos-election-it-2018-02-15';
   $.get('/data/themesit.json', function(data) {
      Object.keys(data).forEach((key) => {
         data[key].forEach((item) => {
            jsonThemeLocal[item.tag] = item;
            $('#sidebar').append(
          `
            <a class="panel-event" id="panel-block-${getCssTag(item.tag)}" data-key="${item.tag}">
               <span class="panel-img">
                  <img class="circular--square" src="${item.picture}" alt=""/>
               </span>
            </a>
            `
            );
            $('#candidatsIntro').append(
                      `
                        <li class="candidatIntro">
                            <a href="?candidat=${item.tag}&file=${lastDate}" onClick="localStorage.setItem('introDone', 'yes');">
                              <img class="circular--square is-inline-block" src="${item.picture}" alt="" />
                              <h2 class="">${item.name}</h2>
                            </a>
                        </li>
                      `
                );
         });
      });
   }).fail(function(err) {
      console.log(err);
   });
   let url = getUrlVar('file') || lastDate;
   if (getUrlVar('file')) {
      $('#video-select').children().each(function() {
         if ($(this)[0].value === getUrlVar('file')) $(this)[0].selected = true;
      });
   }
   $.get('/data/ytrecos-election-it/' + url + '.json', function(data) {
    // console.log(data);
      jsonLocal = data;
      let count = 0;
      Object.keys(jsonLocal).forEach((item) => {
         count += jsonLocal[item].length;
      });
      $('#nb_video').append(count);
      // let random = Math.floor(Math.random() * Object.keys(jsonLocal).length);
      let key = getUrlVar('candidat') || Object.keys(data)[0];
      appendVideo(key);
      appendPresentation(key);
      changeUrlParam('file', url);
   });

   $(document).on('click', '.panel-event', function() {
      const key = $(this).data('key');
      appendPresentation(key);
      appendVideo(key);
   });
   $('.nav-toggle').click(function() {
      $('.nav-right').toggleClass('is-active');
   });

   $(document).on('change', '#video-select', function(event) {
      $.get(
      '/data/ytrecos-election-it/' + event.target.value + '.json',
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
      }
    );
   });

   function getCssTag(tag) {
      return tag.split(' ').pop().replace('?', '');
   }

   function appendPresentation(key) {
      $('#presentation').empty();
      $('#presentation').append(
      `
         <div class="columns">
            <div class="column has-text-centered">
                  <img class="circular--square is-block" src="${jsonThemeLocal[key].picture}" alt=""/>
                  <h1 class="" id="presentation-title">YouTube’s most recommended videos</h1>
                  <h2 class="">from <a class="searched-value" href="https://www.youtube.com/results?search_query=${key}" target="_blank"><span id="selected-key">${key.trim()}</span></a></h2>
            </div>
         </div>
         `
    );
   }

  // Permet d'actualiser les vidéos correspond au theme "key".
   function appendVideo(key) {
      changeUrlParam('candidat', key);
      changeUrlParam('file', url);
      $('#sidebar').children().each(function() {
         $(this).removeClass('is-active');
      });
      $('#panel-block-' + getCssTag(key)).addClass('is-active');
      $('.videos').empty();
      jsonLocal[key].filter((item) => item.likes !== -1).forEach((item, index) => {
         const views = item.views > 0
        ? `${item.views.toLocaleString(true)} views`
        : '';
         const multiplicator = item.mult;
         const mult = multiplicator
        ? `
            <div class="mult" data-balloon-length="large" data-balloon="Based on the candidate search, YouTube recommended this video ${Math.round(item.mult * 10) / 10} more than the average of recommended videos that we scrapped
on ${key}."><div class="mult-x">${Math.round(item.mult * 10) / 10}x </div>
            <div class="mult-text"> more recommended than the average</div> </div>`
        : '';

         if (index > 99) return;
         $('.videos').append(
        `
            <div class="box">
            <article class="media">
               <figure class="media-left level">
                  <small class="video-position level-item">${index + 1}</small>
                  <a href="https://www.youtube.com/watch?v=${item.id}" target="_blank">
                     <div class="is-inline-block level-item">
                        <img class="image" width="170px" src="https://img.youtube.com/vi/${item.id}/hqdefault.jpg">
                     </div>
                  </a>
               </figure>
               <div class="media-content">
                  <div class="content">
                     <a class="video-title" href="https://www.youtube.com/watch?v=${item.id}" target="_blank">${item.title}</a>
                     <div><small class="video-stats">` +
          views +
          `<i class="fa fa-thumbs-up" aria-hidden="true"></i>
                     ${item.likes.toLocaleString(true)}
                     <i class="fa fa-thumbs-down" aria-hidden="true"></i>${item.dislikes.toLocaleString(true)}</small></div>
                  </div>
               </div>
               </article>` +
          mult +
          `</div>
         `
      );
      });

    $('#representation').empty();
    const cscores = {};
    jsonLocal[key]
       .filter((item) => item.likes !== -1)
       .forEach((item) => {
          const title = item.title.toLowerCase();
          if (title.indexOf('renzi') > -1) {
             cscores['Matteo Renzi'] = (cscores['Matteo Renzi'] || 0) + 1;
          }
          if (title.indexOf('berlusconi') > -1) {
             cscores['Silvio Berlusconi'] = (cscores['Silvio Berlusconi'] || 0) + 1;
          }
          if (title.indexOf('di maio') > -1 || title.indexOf('dimaio') > -1) {
             cscores['Luigi Di Maio'] = (cscores['Luigi Di Maio'] || 0) + 1;
          }
          if (title.indexOf('grasso') > -1) {
             cscores['Pietro Grasso'] = (cscores['Pietro Grasso'] || 0) + 1;
          }
          if (title.indexOf('lorenzin') > -1) {
            cscores['Beatrice Lorenzin'] = (cscores['Beatrice Lorenzin'] || 0) + 1;
          }
          if (title.indexOf('bonino') > -1) {
            cscores['Emma Bonino'] = (cscores['Emma Bonino'] || 0) + 1;
          }
          if (title.indexOf('santagata') > -1) {
            cscores['Giulio Santagata'] = (cscores['Giulio Santagata'] || 0) + 1;
          }
          if (title.indexOf('achammer') > -1) {
            cscores['Philipp Achammer'] = (cscores['Philipp Achammer'] || 0) + 1;
          }
          if (title.indexOf('salvini') > -1) {
            cscores['Matteo Salvini'] = (cscores['Matteo Salvini'] || 0) + 1;
          }
          if (title.indexOf('meloni') > -1) {
            cscores['Giorgia Meloni'] = (cscores['Giorgia Meloni'] || 0) + 1;
          }
          if (title.indexOf('fitto') > -1) {
            cscores['Raffaele Fitto'] = (cscores['Raffaele Fitto'] || 0) + 1;
          }
          if (title.indexOf('saponaro') > -1) {
            cscores['Corrado Saponaro'] = (cscores['Corrado Saponaro'] || 0) + 1;
          }
          if (title.indexOf('carofalo') > -1) {
            cscores['Viola Carofalo'] = (cscores['Viola Carofalo'] || 0) + 1;
          }
          if (title.indexOf('di stefano') > -1) {
            cscores['Simone Di Stefano'] = (cscores['Simone Di Stefano'] || 0) + 1;
          }
          if (title.indexOf('adinolfi') > -1) {
            cscores['Mario Adinolfi'] = (cscores['Mario Adinolfi'] || 0) + 1;
          }
          if (title.indexOf('rizzo') > -1) {
            cscores['Marco Rizzo'] = (cscores['Marco Rizzo'] || 0) + 1;
          }
          if (title.indexOf('fiore') > -1) {
            cscores['Roberto Fiore'] = (cscores['Roberto Fiore'] || 0) + 1;
          }
          if (title.indexOf('ferrando') > -1) {
            cscores['Marco Ferrando'] = (cscores['Marco Ferrando'] || 0) + 1;
          }
          if (title.indexOf('ingroia') > -1) {
            cscores['Antonio Ingroia'] = (cscores['Antonio Ingroia'] || 0) + 1;
          }
          // if (title.indexOf('di battista') > -1) {
          //   cscores['Allessandro Di Battista'] = (cscores['Allessandro Di Battista'] || 0) + 1;
          // }
          // if (title.indexOf('travaglio') > -1) {
          //   cscores['Marco Travaglio'] = (cscores['Marco Travaglio'] || 0) + 1;
          // }
          // if (title.indexOf('carelli') > -1) {
          //   cscores['Emilio Carelli'] = (cscores['Emilio Carelli'] || 0) + 1;
          // }
          // if (title.indexOf('sgarbi') > -1) {
          //   cscores['Vittorio Sgarbi'] = (cscores['Vittorio Sgarbi'] || 0) + 1;
          // }
          // if (title.indexOf("d'amico") > -1) {
          //   cscores["Ilaria D'Amico"] = (cscores["Ilaria D'Amico"] || 0) + 1;
          // }
        });
    const sumValues = Object.values(cscores).reduce((a, b) => a + b);

    for (const key in cscores) {
       cscores[key] = cscores[key] / sumValues;
    }

    const sortable = [];
    for (const vehicle in cscores) {
       sortable.push([vehicle, cscores[vehicle]]);
    }

    sortable.sort(function(a, b) {
       return b[1] - a[1];
    });

    for (const i in sortable) {
       $('#representation').append(`
       <div class="candidate-score">
          <span>${sortable[i][0]}
          </span>
          <span class="candidate-percentage">
          </span>
       </div>
       <div class="greybar">
          <div class="redbar" style="width:${sortable[i][1]*100}%"></div>
       </div>`);
    }
   }

  // SLIDER
  if (localStorage.getItem('introDone') !== 'yes') {
    $('#intro').show();
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
    // $('.btn__next').html('Suivant');
      $('.btn__next').show();
    // $('.btn__next').removeClass('hideIntro');

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
      'paginationDot--active'
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
      // $('.btn__next').html('Découvrir !');
         $('.btn__next').hide();
      // $('.btn__next').addClass('hideIntro');
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
    // $('.btn__next').removeClass('hideIntro');
      cycleSlides(currentIndex);
      markDots(currentIndex + 1);
   });
});

function getURLParameter(name) {
   return (
    decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
        location.search
      ) || [, ''])[1]
        .replace(/\+/g, '%20')
    ) || null
   );
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
        currentURL.slice(0, -1) + '&' + param + '=' + value
      );
      } else {
         window.history.replaceState(
        '',
        '',
        currentURL.slice(0, -1) + '?' + param + '=' + value
      );
      }
   }
}
function getUrlVar(key) {
   const result = new RegExp(key + '=([^&]*)', 'i').exec(window.location.search);
   return (result && unescape(result[1])) || '';
}
