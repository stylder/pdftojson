
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

// Will be using promises to load document, pages and misc data instead of
// callback.

const pdf2json =  (pdfPath) => {
    let response = {}
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    return loadingTask.promise
        .then((doc) => {
            const numPages = doc.numPages;
            response['numPages'] = numPages;
    
            let lastPromise; // will be used to chain promises
            lastPromise = doc.getMetadata().then(function (data) {
                // ## Metadata Is Loaded
                // ## Info;
                response['info'] = data.info
                if (data.metadata) {
                    //## Metadata
                    response['metaData'] = data.metadata.getAll()
                }
            });
    
            response['pages'] = []
            const loadPage = function (pageNum) {
                return doc.getPage(pageNum).then(function (page) {
                    // # Page + pageNum
                    const viewport = page.getViewport({ scale: 1.0 });
                    // Size: " + viewport.width + "x" + viewport.height
    
                    return page
                        .getTextContent()
                        .then(function (content) {
                            // Content contains lots of information about the text layout and
                            // styles, but we need only strings at the moment
                            const strings = content.items.map(function (item) {
                                return item.str;
                            });
                            // ## Text Content
                            response['pages'].push(strings.join(" "))
                            page.cleanup();
                        })
                });
            };
            // Loading of the first page will wait on metadata and subsequent loadings
            // will wait on the previous pages.
            for (let i = 1; i <= numPages; i++) {
                lastPromise = lastPromise.then(loadPage.bind(null, i));
            }
            return lastPromise;
        }).then(() => {
            return response
        }).catch((error)=>error);
}


module.exports = pdf2json;
