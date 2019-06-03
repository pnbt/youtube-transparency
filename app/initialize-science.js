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
   const lastDate = 'ytrecos-science-2019-06-01';
   $.get('/data/themesscience.json', function(data) {
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
   $.get('/data/ytrecos-science/' + url + '.json', function(data) {
    // console.log(data);
      jsonLocal = data;
      let count = 0;
      Object.keys(jsonLocal).forEach((item) => {
         count += jsonLocal[item].length;
      });
      $('#nb_video').append(count);
      // let random = Math.floor(Math.random() * Object.keys(jsonLocal).length);
      let key = getUrlVar('candidat') || Object.keys(data)[6];
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
      '/data/ytrecos-science/' + event.target.value + '.json',
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
    if (key === 'all') {
      return;
    }

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

function appendSinkHoles() {
  $('#sidebar').children().each(function() {
    $(this).removeClass('is-active');
  });
  $('#panel-block-all').addClass('is-active');
  $('.videos').empty()

  // Compute the sinkholes
  var counts = {}
  var videos_info = {}
  for (var key in jsonLocal) {
    // check if the property/key is defined in the object itself, not in parent
    if (jsonLocal.hasOwnProperty(key)) {
        jsonLocal[key].filter((item) => item.likes !== -1).forEach((item, index) => {
        counts[item.id] = (counts[item.id] || 0) + 1;
        videos_info[item.id] = item
      })
    }
  }
  var sorted_counts = Object.keys(counts).map(function(key) {
    return [key, counts[key]];
  });

  // Sort the array based on the second element
  sorted_counts.sort(function(first, second) {
      return second[1] - first[1];
  });

  $('.sink-videos').append(
    `
      <div class="sinkhole">Videos recommended from multiple searches: <div>
    `
  )

  sorted_counts.forEach((elem) => {
    var item = videos_info[elem[0]];
    const views = item.views > 0 ? `${item.views.toLocaleString(true)} views` : '';
    const multiplicator = elem[1];
    const mult = multiplicator ? `
          <div class="mult f-right" data-balloon-length="large" data-balloon="YouTube recommended this video after ${Math.round(multiplicator * 10) / 10} different searches"><div class="mult-text"> Number of searches yielding this video:</div><div class="mult-x">${Math.round(multiplicator * 10) / 10} </div>
          </div>`
      : '';

    if (item.views > 0 && multiplicator > 1) {
        $('.sink-videos').append(
      `
          <div class="box">
          <article class="media">
              <figure class="media-left level">
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
    );}
  });
}

// Permet d'actualiser les vidéos correspond au theme "key".
 function appendVideo(key) {
    changeUrlParam('candidat', key);

    if (key=== 'all') {
      appendSinkHoles();
      return;
    }
    $('.sink-videos').empty();
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
          if (title.indexOf('exoplanet') > -1) {
             cscores.Exoplanet = (cscores.Exoplanet || 0) + 1;
          }
          if (title.indexOf('secret') > -1) {
             cscores.Secret = (cscores.Secret || 0) + 1;
          }
          if (title.indexOf('nasa') > -1) {
             cscores.NASA = (cscores.NASA || 0) + 1;
          }
          if (title.indexOf('truth') > -1) {
             cscores.Truth = (cscores.Truth || 0) + 1;
          }
          if (title.indexOf('ufo') > -1) {
             cscores.UFO = (cscores.UFO || 0) + 1;
          }
          if (title.indexOf('alien') > -1) {
             cscores.Alien = (cscores.Alien || 0) + 1;
          }
          if (title.indexOf('flat') > -1) {
             cscores.Flat = (cscores.Flat || 0) + 1;
          }
          if (title.indexOf('round') > -1) {
             cscores.Round = (cscores.Round || 0) + 1;
          }
          if (title.indexOf('dome') > -1) {
             cscores.Dome = (cscores.Dome || 0) + 1;
          }
          if (title.indexOf('god') > -1) {
             cscores.God = (cscores.God || 0) + 1;
          }
          if (title.indexOf('debunk') > -1) {
             cscores.Debunk = (cscores.Debunk || 0) + 1;
          }
          if (title.indexOf('proof') > -1) {
             cscores.Proof = (cscores.Proof || 0) + 1;
          }
          if (title.indexOf('degrasse tyson') > -1) {
             cscores['Neil deGrasse Tyson'] = (cscores['Neil deGrasse Tyson'] || 0) + 1;
          }
          if (title.indexOf('maher') > -1) {
             cscores.Maher = (cscores.Maher || 0) + 1;
          }
          if (title.indexOf('immune') > -1) {
             cscores.Immune = (cscores.Immune || 0) + 1;
          }
          if (title.indexOf('mccarthy') > -1) {
             cscores.McCarthy = (cscores.McCarthy || 0) + 1;
          }
          if (title.indexOf('kill') > -1) {
             cscores.Kill = (cscores.Kill || 0) + 1;
          }
          if (title.indexOf('vaccine') > -1) {
             cscores.Vaccine = (cscores.Vaccine || 0) + 1;
          }
          if (title.indexOf('autism') > -1) {
             cscores.Autism = (cscores.Autism || 0) + 1;
          }
          if (title.indexOf('crazy') > -1) {
             cscores.Crazy = (cscores.Crazy || 0) + 1;
          }
          if (title.indexOf('bullshit') > -1) {
             cscores.Bullshit = (cscores.Bullshit || 0) + 1;
          }
          if (title.indexOf('debate') > -1) {
             cscores.Debate = (cscores.Debate || 0) + 1;
          }
          if (title.indexOf('creation') > -1) {
             cscores.Creation = (cscores.Creation || 0) + 1;
          }
          if (title.indexOf('evolution') > -1) {
             cscores.Evolution = (cscores.Evolution || 0) + 1;
          }
          if (title.indexOf('expose') > -1) {
             cscores.Expose = (cscores.Expose || 0) + 1;
          }
          if (title.indexOf('destroy') > -1) {
             cscores.Destroy = (cscores.Destroy || 0) + 1;
          }
          if (title.indexOf('dinosaur') > -1) {
             cscores.Dinosaur = (cscores.Dinosaur || 0) + 1;
          }
          if (title.indexOf('dinosaur') > -1) {
             cscores.Dinosaur = (cscores.Dinosaur || 0) + 1;
          }
          if (title.indexOf('devos') > -1) {
             cscores.DeVos = (cscores.DeVos || 0) + 1;
          }
          if (title.indexOf('clinton') > -1) {
             cscores.Clinton = (cscores.Clinto || 0) + 1;
          }
          if (title.indexOf('obama') > -1) {
             cscores.Obama = (cscores.Obama || 0) + 1;
          }
          if (title.indexOf('trump') > -1) {
             cscores.Trump = (cscores.Trump || 0) + 1;
          }
          if (title.indexOf('hoax') > -1) {
             cscores.Hoax = (cscores.Hoax || 0) + 1;
          }
          if (title.indexOf('conspiracy') > -1 || title.indexOf('conspiracy') > -1) {
             cscores['Conspiracy'] = (cscores['Conspiracy'] || 0) + 1;
          }
          if (title.indexOf('global warming') > -1 || title.indexOf('global warming') > -1) {
             cscores['Global Warming'] = (cscores['Global Warming'] || 0) + 1;
          }
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
