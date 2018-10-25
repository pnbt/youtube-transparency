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


  //  let jsonLocal = {};
  //  const jsonThemeLocal = {};

  //  var d= $('#date').val()
  //  var filedate = d[3]+d[4]+'-'+d[0]+d[1]+'-'+d[6]+d[7]+d[8]+d[9]
  //  const lastDate = 'us-info-' + filedate;
  //  console.log(lastDate)

  //  let url = getUrlVar('file') || lastDate;
  //  if (getUrlVar('file')) {
  //     $('#video-select').children().each(function() {
  //        if ($(this)[0].value === getUrlVar('file')) $(this)[0].selected = true;
  //     });
  //  }
  //  $.get('/data/info/' + url + '.json', function(data) {
  //     console.log('GOT DATA');
  //     jsonLocal = data;
  //     let count = 0;
  //     Object.keys(jsonLocal).forEach((item) => {
  //        count += jsonLocal[item].length;
  //     });
  //     console.log(count)
  //     $('#nb_video').append(count);
  //     // let random = Math.floor(Math.random() * Object.keys(jsonLocal).length);
  //     let key = 'info_channels';
  //     appendVideo(key);
  //     appendPresentation(key);
  //     changeUrlParam('file', url);
  //  });

  //  $(document).on('click', '.panel-event', function() {
  //     const key = $(this).data('key');
  //     appendPresentation(key);
  //     appendVideo(key);
  //  });
  //  $('.nav-toggle').click(function() {
  //     $('.nav-right').toggleClass('is-active');
  //  });

  //  $(document).on('change', '#video-select', function(event) {
  //     $.get(
  //     '/data/ytrecos-science/' + event.target.value + '.json',
  //     (data) => {
  //        url = event.target.value;
  //        jsonLocal = data;
  //        let count = 0;
  //        changeUrlParam('file', event.target.value);
  //        Object.keys(jsonLocal).forEach((item) => {
  //           count += jsonLocal[item].length;
  //        });
  //        $('#nb_video').empty();
  //        $('#nb_video').append(count);
  //        appendVideo($('#selected-key').text());
  //     }
  //   );
    // var date_input=$('input[name="date"]'); //our date input has the name "date"
    // var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    // var options={
    //       format: 'mm/dd/yyyy',
    //       container: container,
    //       todayHighlight: true,
    //       startDate: '10-09-2018',
    //       autoclose: true,
    // };
    // date_input.datepicker(options).on('changeDate',function(event){
    //   console.log('select')
    //   setTimeout(appendSinkHoles,1000);
    // });
  
  //  });

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
                <img class="circular--square is-block" src="images/all.png" alt=""/>
                <h1 class="" id="presentation-title">YouTube’s most recommended videos</h1>
                <h2 class="">from <a class="searched-value" href="https://www.youtube.com/results?search_query=all" target="_blank"><span id="selected-key">${key.trim()}</span></a></h2>
          </div>
       </div>
       `
  );
 }

function changeTheDate() {
 d= $('#date').val()
 filedate = d[3]+d[4]+'-'+d[0]+d[1]+'-'+d[6]+d[7]+d[8]+d[9]

  console.log('URL Found =')
  console.log(getUrlVar('file'))

 const lastDate = 'us-info-' + filedate;
 let url = getUrlVar('file') || lastDate;
 if (getUrlVar('file')) {
    $('#video-select').children().each(function() {
       if ($(this)[0].value === getUrlVar('file')) $(this)[0].selected = true;
    });
 }
 $.get('/data/info/' + url + '.json', function(data) {
    console.log('GOT DATA');
    jsonLocal = data;
    let count = 0;
    Object.keys(jsonLocal).forEach((item) => {
       count += jsonLocal[item].length;
    });
    console.log(count)
    $('#nb_video').append(count);
    // let random = Math.floor(Math.random() * Object.keys(jsonLocal).length);
    let key = 'info_channels';
    appendVideo(key);
    appendPresentation(key);
    changeUrlParam('file', url);
 });
}

function appendSinkHoles() {
  $('#panel-block-all').addClass('is-active');
  $('.sink-videos').empty()
  $('#presentation').hide()
  $('.video-header').hide()
  $('.videos').hide()

  var keyword = $("#srch-term").val()
  console.log(keyword)

  if (keyword !== '') {
    $('.info-title').css('max-height', '0px')
  }

  $('.video-header').show()
  $('.videos').show()

  // Compute the sinkholes
  var counts = {}
  var videos_info = {}
  for (var key in jsonLocal) {
    console.log(key)
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

  console.log(sorted_counts)

  var filtered_vids = jsonLocal[key].filter((item) => item.likes !== -1).filter((item) => item.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1).map(function(item) {
    return [item.id, 0];
  })

  var extra_text = ''
  if (keyword !== '') {
    extra_text = '&nbsp;including<span class="redbold">&nbsp;"' + keyword + '"</span>&nbsp;in its title';
  }

  $('.sink-videos').append(
    `
      <div class="sinkhole"><span class="redbold">` + filtered_vids.length + ` &nbsp;</span>most recommended videos on &nbsp;<span class="redbold">` + 
        $('#date').val() + '</span>' + extra_text
      + `<div>
    `
  )



  console.log(filtered_vids)

  filtered_vids.slice(0,100).forEach((elem) => {
    console.log('Elem')
    var item = videos_info[elem[0]];
    const views = item.views > 0 ? `${item.views.toLocaleString(true)} views` : '';
    const multiplicator = item['nb_recommendations'];
    const mult = multiplicator ? `
          <div class="mult right" data-balloon-length="large" data-balloon="YouTube recommended this video after ${Math.round(multiplicator * 10) / 10} different searches"><div class="mult-text"> Number of channels recommending it: </div><div class="mult-x">${Math.round(multiplicator * 10) / 10} </div>
          </div>`
      : '';

    if (item.views > 0 && multiplicator > 0) {
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
    appendSinkHoles();
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
        $('.btn__next').addClass('hideIntro');
      }
        if (currentIndex > slidesLength - 2) {
      //if it second to last slide show 'done' instead of 'next'
      // $('.btn__next').html('Découvrir !');
        //  $('.btn__next').hide();
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
