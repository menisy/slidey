Dropzone.options.seriesUpload = {
  autoProcessQueue: false,
  acceptedFiles: '.jpg,.jpeg,.png',
  parallelUploads: 10,
  addRemoveLinks: true,
  init: function() {
    var form = document.querySelector("#series-upload")
    myDropzone = this; // closure

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      myDropzone.processQueue();
    // autoProcessQueue: true// Tell Dropzone to process all queued files.
    });
  }
}
