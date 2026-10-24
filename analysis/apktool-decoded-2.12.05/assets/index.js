


window.download = function (url) {
  PDFJS.cMapUrl = 'https://unpkg.com/pdfjs-dist@1.9.426/cmaps/';
  PDFJS.cMapPacked = true;

  var pdfDoc = null;

  var str = pdfBridge.getByte(url);
  var bytes = JSON.parse(str);
  var bf = new Uint8Array(bytes);
  console.log(bf)
  pdfBridge.onStart();
  PDFJS.getDocument(bf.buffer).then(function (pdf) {
    pdfDoc = pdf;
      pdfBridge.onEnd();
    console.log(pdfDoc)
    for (var i = 1; i <= pdfDoc.numPages; i++) {
      pdfDoc.getPage(i).then(function (page) {
        var viewport = page.getViewport(2.0);
        var canvas = createPage();
        var ctx = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
          canvasContext: ctx,
          viewport: viewport
        });
      });
    }


  });

}



function createPage() {
  var div = document.createElement("canvas");
  document.body.appendChild(div);
  return div;
}



//PDFJS.getDocument(url).then(function (pdf) {
//  pdfDoc = pdf;
//  for (var i = 1; i <= pdfDoc.numPages; i++) {
//    renderPage(i)
//  }
//});