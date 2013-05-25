// Generated by CoffeeScript 1.6.2
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.HTMLProcessor = (function() {
    function HTMLProcessor(sendEvent, setDocumentElementInnerHTML, getIDFn) {
      this.sendEvent = sendEvent;
      this.setDocumentElementInnerHTML = setDocumentElementInnerHTML;
      this.getIDFn = getIDFn;
      this.checkForProcessCompletion = __bind(this.checkForProcessCompletion, this);
      this.receiveFile = __bind(this.receiveFile, this);
      this.removeTrailingSlash = __bind(this.removeTrailingSlash, this);
      this.requestFile = __bind(this.requestFile, this);
      this.isInternalFile = __bind(this.isInternalFile, this);
      this.processElementsWithAttribute = __bind(this.processElementsWithAttribute, this);
      this.triggerOnParentString = __bind(this.triggerOnParentString, this);
      this.processLinks = __bind(this.processLinks, this);
      this.processStyleSheets = __bind(this.processStyleSheets, this);
      this.processScripts = __bind(this.processScripts, this);
      this.processImages = __bind(this.processImages, this);
      this.processImageAsHTML = __bind(this.processImageAsHTML, this);
      this.processTitle = __bind(this.processTitle, this);
      this.processHTML = __bind(this.processHTML, this);
      this.requestedFilenamesToElement = {};
      this.container = null;
      this.completionCallback = null;
    }

    HTMLProcessor.prototype.processHTML = function(html, completionCallback) {
      var container;

      this.completionCallback = completionCallback;
      this.scriptMapping = {};
      container = document.createElement("html");
      container.innerHTML = html.replace(/<\/?html>/g, "");
      this.container = $(container);
      this.processTitle();
      this.processImages();
      this.processScripts();
      this.processStyleSheets();
      this.processLinks();
      return this.checkForProcessCompletion();
    };

    HTMLProcessor.prototype.processTitle = function() {
      var elements,
        _this = this;

      elements = this.container.find("title");
      return elements.each(function(index, el) {
        var $el;

        $el = $(el);
        return document.title = $el.text();
      });
    };

    HTMLProcessor.prototype.processImageAsHTML = function(html, completionCallback) {
      var container, img;

      this.completionCallback = completionCallback;
      container = document.createElement("html");
      this.container = $(container);
      img = "<img style='text-align:center; position:absolute; margin:auto; top:0;right:0;bottom:0;left:0;' ";
      img += " src='" + html + "' />";
      this.container.append($(img));
      return this.completionCallback(this.container[0].outerHTML);
    };

    HTMLProcessor.prototype.processImages = function() {
      return this.processElementsWithAttribute("img[src]", "src", "image");
    };

    HTMLProcessor.prototype.processScripts = function() {
      return this.processElementsWithAttribute("script[src]", "src", "script");
    };

    HTMLProcessor.prototype.processStyleSheets = function() {
      this.processElementsWithAttribute("link[rel=\"stylesheet\"]", "href", "stylesheet");
      return this.processElementsWithAttribute("link[rel=\'stylesheet\']", "href", "stylesheet");
    };

    HTMLProcessor.prototype.processLinks = function() {
      var elements,
        _this = this;

      elements = this.container.find("a[href]");
      return elements.each(function(index, el) {
        var $el, href;

        $el = $(el);
        href = $el.attr("href");
        if (href[0] === "#") {

        } else if (_this.isInternalFile(href)) {
          return $el.attr("onclick", _this.triggerOnParentString("relativeLinkClicked", href));
        } else {
          return $el.attr("target", "_blank");
        }
      });
    };

    HTMLProcessor.prototype.triggerOnParentString = function(eventName, href) {
      return "javascript:top.$(top.document).trigger('" + eventName + "', ['" + href + "']);return false;";
    };

    HTMLProcessor.prototype.processElementsWithAttribute = function(elSelector, attrSelector, type) {
      var elements,
        _this = this;

      elements = this.container.find(elSelector);
      return elements.each(function(index, el) {
        var $el, filename;

        $el = $(el);
        filename = $el.attr(attrSelector);
        if (_this.isInternalFile(filename)) {
          _this.requestedFilenamesToElement[filename] = $el;
          return _this.requestFile(filename, type);
        }
      });
    };

    HTMLProcessor.prototype.isInternalFile = function(filename) {
      if (filename[0] !== "#" && (filename.indexOf(".") !== -1) && filename.match(/(?:https?:\/\/)|(?:data:)/) === null) {
        return true;
      }
      return false;
    };

    HTMLProcessor.prototype.requestFile = function(filename, type) {
      var data;

      console.log("sending socket id " + this.getIDFn());
      data = {
        "filename": filename,
        "socketId": this.getIDFn(),
        "type": type
      };
      return this.sendEvent("requestFile", data);
    };

    HTMLProcessor.prototype.removeTrailingSlash = function(str) {
      if (!str || str === "") {
        return str;
      }
      if (str.charAt(str.length - 1) === "/") {
        return str.substr(0, str.length - 1);
      }
      return str;
    };

    HTMLProcessor.prototype.receiveFile = function(data) {
      var $element, fileContents, fileType, filename, type;

      filename = this.removeTrailingSlash(data.filename);
      console.log("FILENAME: " + filename);
      fileContents = data.fileContents;
      type = data.type;
      fileType = data.fileType;
      if (type === "alink" || type === "backbutton" || type === "initialLoad") {
        this.setDocumentElementInnerHTML({
          "fileContents": data.fileContents,
          "filename": filename,
          "fileType": fileType
        }, type);
      } else {
        $element = this.requestedFilenamesToElement[filename];
        if ($element) {
          if ($element.attr("src") && $element[0].tagName === "IMG") {
            $element.attr("src", fileContents);
          } else if ($element.attr("src") && $element[0].tagName === "SCRIPT") {
            $element.removeAttr("src");
            this.scriptMapping[data.filename] = fileContents;
            $element.append(data.filename);
          } else if ($element[0].tagName === "LINK") {
            $element.replaceWith("<style>" + fileContents + "</style>");
          }
          delete this.requestedFilenamesToElement[filename];
        }
      }
      return this.checkForProcessCompletion();
    };

    HTMLProcessor.prototype.checkForProcessCompletion = function() {
      if (Object.keys(this.requestedFilenamesToElement).length === 0 && this.completionCallback) {
        return this.completionCallback(this.container[0].outerHTML, this.scriptMapping);
      }
    };

    return HTMLProcessor;

  })();

}).call(this);
