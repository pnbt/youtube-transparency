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
   const lastDate = 'ytrecos-kids-2018-03-08';
   $.get('/data/themeskids.json', function(data) {
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
   $.get('/data/ytrecos-kids/' + url + '.json', function(data) {
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
      '/data/ytrecos-kids/' + event.target.value + '.json',
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
    if (key === 'all' || key== 'top') {
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
  $('.sink-videos').empty();

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
                <div class="content" style="width:80%">
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

function isNotBanned(index) {
   return (['RgKAFK5djSk', 'kffacxfA7G4', 'pXRviuL6vMY', 'pXRviuL6vMY', '_Z5-P9v3F8w', 'ru0K8uYEZWw', 'QtXby3twMmI', 'Pw-0pbY9JeU', 'SYM-RJwSGQ8', 'CHVhwcOg6y8', 'LXUSaVw3Mvk', 'ESXgJ9-H-2U', 'ypPSrRYOAj4', 'V1bFr2SWP1I', 'SDTZ7iX4vTQ', 'oh2LWWORoiM', '4ZHwu0uut3k', 'LsoLEjrDogU', ''].indexOf(index) === -1)
}

function positiveDisplay(number) {
  if (number === -1) {
    return '';
  }
  return number.toLocaleString(true)
}


function appendTops() {
  $('#sidebar').children().each(function() {
    $(this).removeClass('is-active');
  });
  $('#panel-block-top').addClass('is-active');
  $('.videos').empty()
  $('.sink-videos').empty();
  $('.nav-third').hide();

  // Compute the sinkholes
  var counts = {}
  var videos_info = {}
  for (var key in jsonLocal) {
    // check if the property/key is defined in the object itself, not in parent
    if (jsonLocal.hasOwnProperty(key)) {
        jsonLocal[key].filter((item) => item.views !== -1).forEach((item, index) => {
        counts[item.id] = item.views;
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
      <div class="sinkhole">100 of The Most Recommended Kids Videos<div class="view_count"><span id="total_views"></span> views - <span>🌎 🌎 🌎 🌎 🌎 🌎 🌎</span></div><div>
    `
  )
  var total_views = 0;

  sorted_counts.filter((item) => isNotBanned(item[0])).slice(0, 100).forEach((elem) => {
    console.log(elem[0])
    var item = videos_info[elem[0]];
    const views = item.views > 0 ? `${item.views.toLocaleString(true)} views` : '';
    const multiplicator = elem[1];
    const mult = multiplicator ? `
          <div class="mult f-right" data-balloon-length="large" data-balloon="This video has been viewed at least ${Number(multiplicator).toLocaleString()} times"><div class="mult-text"> Views:</div><div class="mult-x">${Number(multiplicator).toLocaleString()} </div>
          </div>`
      : '';

    if (item.views > 0 && multiplicator > 1) {
        total_views += item.views;
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
                <div class="content" style="width:60%">
                    <a class="video-title" href="https://www.youtube.com/watch?v=${item.id}" target="_blank">${item.title}</a>
                    <div><small class="video-stats">` +
        views +
        `<i class="fa fa-thumbs-up" aria-hidden="true"></i>
                    ${positiveDisplay(item.likes)}
                    <i class="fa fa-thumbs-down" aria-hidden="true"></i>${positiveDisplay(item.dislikes)}</small></div>
                </div>
              </div>
              </article>` +
        mult +
        `</div>
        `
    );}
  });
  $('#total_views').text(positiveDisplay(total_views));
}


// Permet d'actualiser les vidéos correspond au theme "key".
 function appendVideo(key) {
    changeUrlParam('candidat', key);

    if (key=== 'all') {
      appendSinkHoles();
      return;
    }
    if (key=='top') {
      appendTops()
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
    console.log('Key = ')
    console.log(key)
    jsonLocal[key]
       .filter((item) => item.likes !== -1)
       .forEach((item) => {
          const title = item.title.toLowerCase();
          if (title.indexOf('learn') > -1) {
            cscores.Learn = (cscores.Learn || 0) + 1;
          }
          if (title.indexOf('letter') > -1) {
            cscores.Letter = (cscores.Letter || 0) + 1;
          }
          if (title.indexOf('shark') > -1) {
            cscores.Shark = (cscores.Shark || 0) + 1;
          }
          if (title.indexOf('number') > -1) {
            cscores.Number = (cscores.Number || 0) + 1;
          }
          if (title.indexOf('color') > -1) {
            cscores.Color = (cscores.Color || 0) + 1;
          }
          if (title.indexOf('shape') > -1) {
            cscores.Shape = (cscores.Shape || 0) + 1;
          }
          if (title.indexOf('peppa') > -1) {
            cscores.Peppa = (cscores.Peppa || 0) + 1;
          }
          if (title.indexOf('nursery rhym') > -1) {
            cscores['Nursery Rhymes'] = (cscores['Nursery Rhymes'] || 0) + 1;
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
