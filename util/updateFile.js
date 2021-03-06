const s3 = require('./s3.js');
const fs = require('fs');
const path = require('path');

function carouselItems(rootPath,brochName, pages){
  var carousel = '';
  pages.forEach((page, i) => {
    carousel = carousel + `
      <div class="item ${(i === 0) ? 'active' : ''}">
        <img style= "min-width: 75%;
        max-width: 100%;
          margin: 0 auto;"
        data-lazy-loaded="" data-src="${rootPath}/${brochName}/${page}" />
      </div>
    `
  });

  return carousel;
}
const styles = `
<style>
  *{
    cursor: none!important;
  }
</style>
`
const bootstrapIncludes = `
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.18/jquery.touchSwipe.min.js"></script>
`
const clickListeners = `
  <script>
  document.addEventListener('contextmenu', event => event.preventDefault());

  $(function() {
    //Enable swiping...
    $(".modal").swipe( {
      //Generic swipe handler for all directions
      swipeRight:function(event, direction, distance, duration, fingerCount, fingerData) {
        $(this).find('.carousel').carousel('prev');
      },
      swipeLeft:function(event, direction, distance, duration, fingerCount, fingerData) {
        $(this).find('.carousel').carousel('next');
      },
      //Default is 75px, set to 0 for demo so any distance triggers swipe
       threshold:50
    });
  });

  $(document).ready(function(){

    console.log("ready");
    var playing = false;
    $(document).on('click', 'video', function(){
      $('.slide-background video').attr('loop', 'loop');
      if(!playing){
        this.play();
      }else{
        this.pause();
      }
      playing = !playing;
    });

    $('.album').each((i, elem) => {
      // var href = elem.href;
      // var regex = /#(broch-(.*))$/;
      // var match = regex.exec(href);
      var brochName = $(elem).data('album');
      $(elem).on('click', (e) => {
        e.preventDefault();
        $('#'+brochName+ ' img[data-src]').each(function(i, img){
          console.log(img);
          $(img).attr('src', $(img).data('src'));
          img.onload = function() {
            $(img).removeAttr('data-src');
          };
        });
        $('#'+brochName).modal('show');
      });
    });

    vid = $('video');
  });
  </script>
`


const createModals = function(obj, bucketName, rootFolder){
  if(obj.success){
    console.log('creating modals');
    var folders = obj.data;
    var modals = '';

    Object.keys(folders).map(function(objectKey, index) {
      var rootPath = 'https://s3.eu-west-2.amazonaws.com/'+bucketName;//+'/'+rootFolder;
      var brochureName = objectKey;
      var brochurePages = folders[objectKey];
      var modal = `
        <div class="modal fade" id="${brochureName}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" style="width: 100%; height: 100%;" role="document">
            <div class="modal-content" style="height: auto; min-height: 98%;">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              </div>
              <div class="modal-body">
                <div id="${brochureName}-carousel" class="carousel slide" data-interval="0" data-ride="carousel">
                  <div class="carousel-inner">
    `                 + carouselItems(rootPath, brochureName, brochurePages) + `
                  </div>
                  <a class="left carousel-control" href="#${brochureName}-carousel" data-slide="prev">
                    <span class=""></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="right carousel-control" href="#${brochureName}-carousel" data-slide="next">
                    <span class=""></span>
                    <span class="sr-only">Next</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      modals = modals + modal;
    });


    fs.appendFile(path.join(__dirname, '/../public/present.html'),
      (bootstrapIncludes + modals + clickListeners + styles),
         function (err) {
          if (err) {console.log(err); return false;}
          console.log('All set!');
          fs.readFile(path.join(__dirname, '/../public/present.html'), 'utf8', function(err, data){
            s3.uploadPresentation(data, function(err, data){
              if (err) {console.log(err); return false;}
              console.log('All cool!!');
            });
          });
        });
  }else{
    console.log('error');
    console.log(obj.data);
  }
}
const updateFile = function(bucketName, rootFolder){
  try{
    s3.getBrochures(bucketName, rootFolder, createModals);
  }catch(error){
    console.log(error)
  }
}

module.exports = updateFile;
// fs.appendFile('index.html', str, function (err) {
//   if (err) throw err;
//   console.log('Done!');
// });
