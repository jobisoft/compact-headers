var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { ExtensionSupport } = ChromeUtils.import("resource:///modules/ExtensionSupport.jsm");
//var Services = globalThis.Services || ChromeUtils.import("resource://gre/modules/Services.jsm");
var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
var gTabmail = Services.wm.getMostRecentBrowserWindow().gTabmail;

let doToggle = undefined; //declare it here to make removeEventlistener work

function stopDblclick(e) {
  e.stopPropagation();
}

function stopContext(e) {
  e.preventDefault();
}

var compactHeadersApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      compactHeadersApi: {
        async compactHeaders(windowId) {
          ExtensionSupport.registerWindowListener("compactHeadersListener", {
            chromeURLs: [
              "chrome://messenger/content/messenger.xhtml",
              "chrome://messenger/content/messageWindow.xhtml"
            ],
            onLoadWindow(window) {
              let browser = context.extension.windowManager.get(windowId, context).window.getBrowser();
              let aboutMessage = browser.getRootNode();
              //browser.setAttribute("chActive", true);
              //console.debug("start checking");
              let msgHeaderView = aboutMessage.getElementById("msgHeaderView");
              let messageHeader = aboutMessage.getElementById("messageHeader");
              let messagepanebox = aboutMessage.getElementById("messagepanebox");

              let headerViewToolbox = aboutMessage.getElementById("header-view-toolbox");
              let headerViewToolbar = aboutMessage.getElementById("header-view-toolbar");
              let otherActionsBox = aboutMessage.getElementById("otherActionsBox");
              //let mailContext = aboutMessage.getElementById("mailContext");
              //let menu_HeadersPopup = window.document.getElementById("menu_HeadersPopup");
              let headerViewAllHeaders = aboutMessage.getElementById("headerViewAllHeaders");

              let compactHeadersPopup = aboutMessage.createXULElement("menupopup");
              compactHeadersPopup.id = "compactHeadersPopup";
              msgHeaderView.setAttribute("context", "compactHeadersPopup");

              let compactHeadersSingleLine = aboutMessage.createXULElement("menuitem");
              compactHeadersSingleLine.id = "compactHeadersSingleLine";
              compactHeadersSingleLine.setAttribute("type", "checkbox");
              compactHeadersSingleLine.setAttribute("label", "Single Line Headers");
              compactHeadersSingleLine.setAttribute("tooltiptext", "Displays compact headers on a single line");
              compactHeadersSingleLine.addEventListener("command", () => setLines());

              let compactHeadersHideToolbar = aboutMessage.createXULElement("menuitem");
              compactHeadersHideToolbar.id = "compactHeadersHideToolbar";
              compactHeadersHideToolbar.setAttribute("type", "checkbox");
              compactHeadersHideToolbar.setAttribute("label", "Hide Header Toolbar");
              compactHeadersHideToolbar.setAttribute("tooltiptext", "Hides the header toolbar");
              compactHeadersHideToolbar.addEventListener("command", () => toggleToolbar());

              let compactHeadersMoveToHeader = aboutMessage.createXULElement("menuitem");
              compactHeadersMoveToHeader.id = "compactHeadersMoveToHeader";
              compactHeadersMoveToHeader.setAttribute("type", "checkbox");
              compactHeadersMoveToHeader.setAttribute("label", "Show To Header");
              compactHeadersMoveToHeader.setAttribute("tooltiptext", "Shows the To header on the first line in double line mode");
              compactHeadersMoveToHeader.addEventListener("command", () => toggleToHeader());

              let compactHeadersMoveCcHeader = aboutMessage.createXULElement("menuitem");
              compactHeadersMoveCcHeader.id = "compactHeadersMoveCcHeader";
              compactHeadersMoveCcHeader.setAttribute("type", "checkbox");
              compactHeadersMoveCcHeader.setAttribute("label", "Show Cc Header");
              compactHeadersMoveCcHeader.setAttribute("tooltiptext", "Shows the Cc header on the first line in double line mode");
              compactHeadersMoveCcHeader.addEventListener("command", () => toggleCcHeader());

              let compactHeadersMoveContentBaseheader = aboutMessage.createXULElement("menuitem");
              compactHeadersMoveContentBaseheader.id = "compactHeadersMoveContentBaseheader";
              compactHeadersMoveContentBaseheader.setAttribute("type", "checkbox");
              compactHeadersMoveContentBaseheader.setAttribute("label", "Show Website (RSS)");
              compactHeadersMoveContentBaseheader.setAttribute("tooltiptext", "Shows the Website from RSS messages on the first line in double line mode");
              compactHeadersMoveContentBaseheader.addEventListener("command", () => toggleContentBaseHeader());

              let compactHeadersmovetags = aboutMessage.createXULElement("menuitem");
              compactHeadersmovetags.id = "compactHeadersmovetags";
              compactHeadersmovetags.setAttribute("type", "checkbox");
              compactHeadersmovetags.setAttribute("label", "Show Message Tags");
              compactHeadersmovetags.setAttribute("tooltiptext", "Show message Tags on the second line in double line mode");
              compactHeadersmovetags.addEventListener("command", () => toggleTags());

              let compactHeadersViewAll = aboutMessage.createXULElement("menuitem");
              compactHeadersViewAll.id = "compactHeadersViewAll";
              compactHeadersViewAll.setAttribute("type", "checkbox");
              compactHeadersViewAll.setAttribute("label", "View All Headers");
              compactHeadersViewAll.setAttribute("tooltiptext", "Show All or Normal headers from a message in expanded mode");
              compactHeadersViewAll.addEventListener("command", () => markHeaders());

              try {
                let compactHeadersBox = aboutMessage.getElementById("compactHeadersBox");
                if (compactHeadersBox) compactHeadersBox.remove();
              } catch(e) {}
                let compactHeadersBox = aboutMessage.createXULElement("vbox");
                compactHeadersBox.id = "compactHeadersBox";
                compactHeadersBox.setAttribute("style","margin-inline-start: -8px; position: relative; z-index: 1;");
                let compactHeadersButton = aboutMessage.createXULElement("button");
                compactHeadersButton.id = "compactHeadersButton";
                compactHeadersButton.addEventListener("command", () => toggleHeaders());
                compactHeadersBox.append(compactHeadersButton);

              let compactHeadersLocale = window.navigator.language;
              if (compactHeadersLocale != "de") compactHeadersButton.setAttribute("accesskey", "D");
              compactHeadersButton.setAttribute("style","background: transparent; margin: 0px -2px 0px 2px;\
                -moz-user-focus: ignore; border: 4px solid transparent; min-height: 0px; min-width: 0px;\
                padding: 0px !important; box-shadow: none; -moz-appearance: none;  fill: currentColor;");

              let compactHeadersSeparator = aboutMessage.createXULElement("menuseparator");
              compactHeadersSeparator.id = "compactHeadersSeparator";

              //let compactHeadersHideHeaders = aboutMessage.createXULElement("menuitem");
              //compactHeadersHideHeaders.id = "compactHeadersHideHeaders";
              //compactHeadersHideHeaders.addEventListener("command", () => hideHeaders());

              //let compactHeadersSeparator2 = aboutMessage.createXULElement("menuseparator");
              //compactHeadersSeparator2.id = "compactHeadersSeparator2";

              let compactHeadersSeparator3 = aboutMessage.createXULElement("menuseparator");
              compactHeadersSeparator3.id = "compactHeadersSeparator3";

              let compactHeadersSeparator4 = aboutMessage.createXULElement("menuseparator");
              compactHeadersSeparator4.id = "compactHeadersSeparator4";

              //let compactHeadersHideHeaders2 = aboutMessage.createXULElement("menuitem");
              //compactHeadersHideHeaders2.id = "compactHeadersHideHeaders2";
              //compactHeadersHideHeaders2.addEventListener("command", () => hideHeaders());

              let expandedfromRow = aboutMessage.getElementById("expandedfromRow");
              expandedfromRow.setAttribute("style", "align-items: center; margin-block: inherit; margin-inline: -2px auto; overflow: hidden; min-width: fit-content;");
              expandedfromRow.insertAdjacentElement("afterbegin", compactHeadersBox);
              let expandedfromBox = aboutMessage.getElementById("expandedfromBox");
              expandedfromBox.setAttribute("style", "margin-block: 1px; overflow: hidden; min-width: 250%; margin-inline-end: 1.6em;");
              expandedfromBox.firstChild.nextSibling.style.flexWrap = "nowrap";
              expandedfromBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedfromLabel = aboutMessage.getElementById("expandedfromLabel");
              if (expandedfromLabel) expandedfromLabel.style.width = "4em";
              if (expandedfromLabel) expandedfromLabel.style.marginInline = "-2px";

              let expandedtoRow = aboutMessage.getElementById("expandedtoRow");
              let expandedtoBox = aboutMessage.getElementById("expandedtoBox");
              expandedtoBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedtoLabel = aboutMessage.getElementById("expandedtoLabel");

              let expandedccRow = aboutMessage.getElementById("expandedccRow");
              let expandedccBox = aboutMessage.getElementById("expandedccBox");
              expandedccBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedccLabel = aboutMessage.getElementById("expandedccLabel");

              let expandedcontentBaseRow = aboutMessage.getElementById("expandedcontent-baseRow");
              let expandedcontentBaseBox = aboutMessage.getElementById("expandedcontent-baseBox");
              if (expandedcontentBaseBox) expandedcontentBaseBox.addEventListener("contextmenu", stopContext, true);
              if (expandedcontentBaseBox) expandedcontentBaseBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedcontentBaseLabel = aboutMessage.getElementById("expandedcontent-baseLabel");

              let expandedsubjectRow = aboutMessage.getElementById("expandedsubjectRow");
              if (expandedsubjectRow) expandedsubjectRow.setAttribute("style", "overflow: hidden; margin-block: -1px 0;");

              let expandedsubjectBox = aboutMessage.getElementById("expandedsubjectBox");
              if (expandedsubjectBox) expandedsubjectBox.addEventListener("dblclick", stopDblclick, true);
              if (expandedsubjectBox) expandedsubjectBox.addEventListener("contextmenu", stopContext, true);

              let expandedsubjectLabel = aboutMessage.getElementById("expandedsubjectLabel");
              if (expandedsubjectLabel) expandedsubjectLabel.addEventListener("mouseover", () => setTooltip());
              if (expandedsubjectLabel) expandedsubjectLabel.style.marginBlock = "auto";

              let dateLabel = aboutMessage.getElementById("dateLabel");
              if (dateLabel) dateLabel.setAttribute("style", "margin: auto 6px auto auto; min-width: fit-content; padding-inline-start: 1em;");
              if (dateLabel) dateLabel.addEventListener("dblclick", stopDblclick, true);
              if (dateLabel) dateLabel.addEventListener("contextmenu", stopContext, true);
              let dateLabelSubject = aboutMessage.getElementById("dateLabelSubject");

              let expandedtagsBox = aboutMessage.getElementById("expandedtagsBox");
              let expandedtagsRow = aboutMessage.getElementById("expandedtagsRow");

              let encryptionTechBtn = aboutMessage.getElementById("encryptionTechBtn");
              if (encryptionTechBtn) encryptionTechBtn.setAttribute("style", "margin-block: -4px;");

              let newsgroupsHeading = aboutMessage.getElementById("newsgroupsHeading");
              if (newsgroupsHeading) newsgroupsHeading.setAttribute("style", "margin-block: auto;");

              let headerSenderToolbarContainer = aboutMessage.getElementById("headerSenderToolbarContainer");
              if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.display = "flex";
              if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.minHeight = "var(--recipient-avatar-size)";
              let headerSubjectSecurityContainer = aboutMessage.getElementById("headerSubjectSecurityContainer");

              let headerHideLabels = aboutMessage.getElementById("headerHideLabels");
              if (headerHideLabels) headerHideLabels.addEventListener("command", () => checkHiddenLabels());

              let expandedmessageIdBox = aboutMessage.getElementById("expandedmessage-idBox");
              if (expandedmessageIdBox) expandedmessageIdBox.addEventListener("contextmenu", stopContext, true);

              let expandedinReplyToBox = aboutMessage.getElementById("expandedin-reply-toBox");
              if (expandedinReplyToBox) expandedinReplyToBox.addEventListener("contextmenu", stopContext, true);

              let expandedreferencesBox = aboutMessage.getElementById("expandedreferencesBox");
              if (expandedreferencesBox) expandedreferencesBox.addEventListener("contextmenu", stopContext, true);

              let expandednewsgroupsBox = aboutMessage.getElementById("expandednewsgroupsBox");
              if (expandednewsgroupsBox) expandednewsgroupsBox.addEventListener("contextmenu", stopContext, true);

              let singleMessage = aboutMessage.getElementById("singleMessage");
              if (singleMessage) singleMessage.setAttribute("style", "background-color: buttonface !important");

              let mainPopupSet = window.document.getElementById("mainPopupSet")

              compactHeadersPopup.append(compactHeadersSingleLine);
              compactHeadersPopup.append(compactHeadersSeparator3);
              compactHeadersPopup.append(compactHeadersMoveToHeader);
              compactHeadersPopup.append(compactHeadersMoveCcHeader);
              compactHeadersPopup.append(compactHeadersMoveContentBaseheader);
              compactHeadersPopup.append(compactHeadersmovetags);
              compactHeadersPopup.append(compactHeadersSeparator4);
              compactHeadersPopup.append(compactHeadersHideToolbar);
              compactHeadersPopup.append(compactHeadersSeparator);
              compactHeadersPopup.append(compactHeadersViewAll);
              if (msgHeaderView.lastChild.id == "compactHeadersPopup") {
                //console.debug("compactHeadersPopup exists");
                } else {
                msgHeaderView.append(compactHeadersPopup);
                //console.debug("compactHeadersPopup added");
              }

              //mailContext.append(compactHeadersHideHeaders);
              //menu_HeadersPopup.append(compactHeadersSeparator2);
              //menu_HeadersPopup.append(compactHeadersHideHeaders2);

              doToggle = () => toggleHeaders();
              setdblclick();
              if (headerViewToolbar) headerViewToolbar.addEventListener("dblclick", stopDblclick, true);

              function setdblclick() {
                if (messageHeader.getAttribute("doubleclick") == "added") {
                  //console.debug("doubleclick exists");
                } else {
                  messageHeader.addEventListener("dblclick", doToggle, { once: true });
                  messageHeader.setAttribute("doubleclick", "added");
                  //console.debug("doubleclick added");
                }
              }

              function singleLine() {
                headerViewToolbox.setAttribute("style", "display: none;");
                if (messageHeader.getAttribute("compact") == "compact") {
                  headerSenderToolbarContainer.style.marginBottom = "unset";
                  expandedfromRow.insertAdjacentElement("beforebegin", headerSubjectSecurityContainer);
                  headerSubjectSecurityContainer.setAttribute("style", "max-width: 75%; height: 1.3em; z-index: 1; padding-inline-start: 2em;\
                    margin-block: -1em; margin-inline-start: -2em; background: linear-gradient(to right,transparent,buttonface 2em) !important;");
                  expandedfromRow.style.flex="auto";
                  expandedtoRow.setAttribute("style", "display: none;");
                  expandedccRow.setAttribute("style", "display: none;");
                  expandedcontentBaseRow.setAttribute("style", "display: none;");
                } else {
                  doubleLine();
                }
              }

              function doubleLine() {
                msgHeaderView.removeAttribute("style");
                headerViewToolbox.setAttribute("style", "display: flex;");
                headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
                headerSenderToolbarContainer.style.marginBottom = "-3px";
                expandedfromRow.style.flex="inherit";
                expandedtoRow.removeAttribute("style");
                expandedccRow.removeAttribute("style");
                expandedcontentBaseRow.removeAttribute("style");
              }

              function setLines() {
                if (messageHeader.getAttribute("singleline") == "singleline") {
                  messageHeader.setAttribute("singleline", "");
                  doubleLine();
                  checkHeaders();
                } else {
                  messageHeader.setAttribute("singleline", "singleline");
                  checkHeaders();
                  singleLine();
                }
                moveExpandedtagsBox();
              }

              function checkLines() {
                if (messageHeader.getAttribute("singleline") == "singleline") {
                  compactHeadersSingleLine.setAttribute("checked",true);
                  singleLine();
                } else {
                  compactHeadersSingleLine.setAttribute("checked",false);
                  doubleLine();
                }
              }

              function toggleToolbar() {
                if (messageHeader.getAttribute("hidetoolbar") == "hidetoolbar") {
                  messageHeader.removeAttribute("hidetoolbar");
                } else {
                  messageHeader.setAttribute("hidetoolbar", "hidetoolbar");
                }
                checkToolbar();
              }

              function markToolbar() {
                if (messageHeader.getAttribute("hidetoolbar") == "hidetoolbar") {
                  compactHeadersHideToolbar.setAttribute("checked",true);
                } else {
                  compactHeadersHideToolbar.setAttribute("checked",false);
                }
              }

              //function hideHeaders() {
                //if (messageHeader.getAttribute("hideheaders") == "hideheaders") {
                  //compactHeadersHideHeaders.setAttribute("label", "Hide Headers");
                  //compactHeadersHideHeaders2.setAttribute("label", "Hide Headers");
                  //msgHeaderView.setAttribute("style", "background: buttonface !important;");
                  //messageHeader.removeAttribute("hideheaders");
                //} else {
                  //compactHeadersHideHeaders.setAttribute("label", "Show Headers");
                  //compactHeadersHideHeaders2.setAttribute("label", "Show Headers");
                  //msgHeaderView.setAttribute("style", "margin-top: -1px; visibility: collapse;");
                  //messageHeader.setAttribute("hideheaders", "hideheaders");
                //}
              //}

              function checkHeaders() {
                messageHeader.setAttribute("persist", "compact; singleline; hidetoolbar; hideheaders; movetoheader; moveccheader; movecontentbaseheader; movetags");
                headerSubjectSecurityContainer.removeAttribute("hidden");

                if (headerViewAllHeaders.getAttribute("checked") == "true") window.MsgViewAllHeaders();
                else window.MsgViewNormalHeaders();

                //if (messageHeader.getAttribute("hideheaders") == "hideheaders") {
                  //compactHeadersHideHeaders.setAttribute("label", "Show Headers");
                  //compactHeadersHideHeaders2.setAttribute("label", "Show Headers");
                  //msgHeaderView.setAttribute("style", "margin-top: -1px; visibility: collapse;");
                //} else {
                  //compactHeadersHideHeaders.setAttribute("label", "Hide Headers");
                  //compactHeadersHideHeaders2.setAttribute("label", "Hide Headers");
                  //msgHeaderView.setAttribute("style", "background: buttonface !important;");
                //}

                if (messageHeader.getAttribute("compact") == "compact") setCompactHeaders();
                else setDefaultHeaders();

                setDateLabelSubject();
                checkToolbar();
                moveExpandedtagsBox();
                checkHiddenLabels();
                console.debug("headers checked");
              }

              function setCompactHeaders() {
                headerSenderToolbarContainer.style.flexWrap = "unset";
                if (messageHeader.getAttribute("singleline") == "singleline") messageHeader.style.paddingBottom = "3px";
                else messageHeader.style.paddingBottom = "6px";
                compactHeadersButton.setAttribute("class", "button button-flat");
                //console.debug("arrow-right");
                compactHeadersButton.image = "chrome://messenger/skin/overrides/arrow-right-12.svg";
                compactHeadersBox.setAttribute("style","margin-inline-start: -8px; position: relative; z-index: 1;");
                compactHeadersButton.setAttribute("tooltiptext", "Show Details");
                var i;
                for (i = 1; i < messageHeader.childElementCount; i++) {
                  messageHeader.children[i].setAttribute("persist", "style");
                  messageHeader.children[i].setAttribute("style", "display: none;");
                  if (messageHeader.getAttribute("singleline") != "singleline") headerSubjectSecurityContainer.setAttribute("style", "height: 1.3em;");
                }
                if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow: hidden; -webkit-line-clamp: 1; max-width: fit-content;");
                if (messageHeader.getAttribute("singleline") == "singleline") singleLine();
                else doubleLine();

                headerViewToolbox.style.flex="auto";
                expandedfromRow.insertAdjacentElement("beforebegin", expandedcontentBaseRow);
                expandedcontentBaseRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                  margin-block: -6px; padding-block: 6px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 2; flex: inherit;");
                expandedcontentBaseBox.setAttribute("style", "max-block-size: 1.5em; min-height:18px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: -99em;");
                expandedfromRow.insertAdjacentElement("beforebegin", expandedccRow);
                expandedccRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                  margin-block: -6px; padding-block: 6px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 2; flex: inherit;");
                expandedccBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                expandedfromRow.insertAdjacentElement("beforebegin", expandedtoRow);
                expandedtoRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                  margin-block: -6px; padding-block: 6px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 1; flex: inherit;");
                expandedtoBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                if ((messageHeader.getAttribute("movecontentbaseheader") != "movecontentbaseheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                  expandedcontentBaseRow.style.display = "none";
                }
                if ((messageHeader.getAttribute("moveccheader") != "moveccheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                  expandedccRow.style.display = "none";
                }
                if ((messageHeader.getAttribute("movetoheader") != "movetoheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                  expandedtoRow.style.display = "none";
                }
              }

              function setDefaultHeaders() {
                headerSenderToolbarContainer.style.flexWrap = "wrap";
                messageHeader.style.paddingBottom = "0px";
                compactHeadersButton.setAttribute("class", "button button-flat");
                //console.debug("arrow-down");
                compactHeadersButton.image = "chrome://messenger/skin/overrides/arrow-down-12.svg";
                compactHeadersBox.setAttribute("style","margin-inline-start: -8px; position: relative; z-index: 1;");
                compactHeadersButton.setAttribute("tooltiptext", "Hide Details");
                var i;
                for (i = 1; i < messageHeader.childElementCount; i++) {
                  messageHeader.children[i].setAttribute("persist", "style");
                  messageHeader.children[i].removeAttribute("style");
                  headerSubjectSecurityContainer.setAttribute("style", "height: 1.3em;");
                }
                if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow-x: hidden; -webkit-line-clamp: 3; max-width: fit-content;");
                doubleLine();

                headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedcontentBaseRow);
                expandedcontentBaseRow.removeAttribute("style");
                expandedcontentBaseBox.removeAttribute("style");
                headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedccRow);
                expandedccRow.removeAttribute("style");
                expandedccBox.removeAttribute("style");
                headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedtoRow);
                expandedtoRow.removeAttribute("style");
                expandedtoBox.removeAttribute("style");
              }

              function markHeaders() {
                if (compactHeadersViewAll.getAttribute("checked") == "true") {
                  headerViewAllHeaders.setAttribute("checked", true)
                } else {
                  headerViewAllHeaders.setAttribute("checked", false);
                }
                checkHeaders();
              }

              function setDateLabelSubject() {
                expandedsubjectBox.insertAdjacentElement("afterend", dateLabel);
                dateLabelSubject.setAttribute("style", "display: none;");
              }

              function toggleHeaders() {
                switch(messageHeader.getAttribute("compact")) {
                case "compact": messageHeader.removeAttribute("compact");
                break;
                default: messageHeader.setAttribute("compact", "compact");
                }
                messageHeader.addEventListener("dblclick", doToggle, { once: true });
                checkHeaders();
              }

              function checkToolbar() {
                if (messageHeader.getAttribute("hidetoolbar") == "hidetoolbar") {
                  hideToolbar();
                } else {
                  showToolbar();
                }
              }

              function hideToolbar() {
                headerViewToolbar.setAttribute("style", "display: none;");
              }

              function showToolbar() {
                headerViewToolbar.setAttribute("style", "margin: -1px -1em -1px -2em; padding: 0px 1em 0px 2.2em; position: relative; z-index: 3;\
                  background: linear-gradient(to right,transparent,buttonface 2em) !important; min-width: max-content; min-height: 1.8em;");
              }

              function toggleToHeader() {
                if (messageHeader.getAttribute("movetoheader") == "movetoheader") {
                  messageHeader.removeAttribute("movetoheader");
                } else {
                  messageHeader.setAttribute("movetoheader", "movetoheader");
                }
                checkHeaders();
              }

              function toggleCcHeader() {
                if (messageHeader.getAttribute("moveccheader") == "moveccheader") {
                  messageHeader.removeAttribute("moveccheader");
                } else {
                  messageHeader.setAttribute("moveccheader", "moveccheader");
                }
                checkHeaders();
              }

              function toggleContentBaseHeader() {
                if (messageHeader.getAttribute("movecontentbaseheader") == "movecontentbaseheader") {
                  messageHeader.removeAttribute("movecontentbaseheader");
                } else {
                  messageHeader.setAttribute("movecontentbaseheader", "movecontentbaseheader");
                }
                checkHeaders();
              }

              function toggleTags() {
                if (messageHeader.getAttribute("movetags") == "movetags") {
                  messageHeader.removeAttribute("movetags");
                } else {
                  messageHeader.setAttribute("movetags", "movetags");
                }
                checkHeaders();
              }

              function checkToCcHeaders() {
                if (messageHeader.getAttribute("movetoheader") == "movetoheader") {
                  compactHeadersMoveToHeader.setAttribute("checked",true);
                } else {
                  compactHeadersMoveToHeader.setAttribute("checked",false);
                }
                if (messageHeader.getAttribute("moveccheader") == "moveccheader") {
                  compactHeadersMoveCcHeader.setAttribute("checked",true);
                } else {
                  compactHeadersMoveCcHeader.setAttribute("checked",false);
                }
                if (messageHeader.getAttribute("movecontentbaseheader") == "movecontentbaseheader") {
                  compactHeadersMoveContentBaseheader.setAttribute("checked",true);
                } else {
                  compactHeadersMoveContentBaseheader.setAttribute("checked",false);
                }
                if (messageHeader.getAttribute("movetags") == "movetags") {
                  compactHeadersmovetags.setAttribute("checked",true);
                } else {
                  compactHeadersmovetags.setAttribute("checked",false);
                }
              }

              function setTooltip() {
                if (expandedsubjectLabel) expandedsubjectLabel.setAttribute("tooltiptext", expandedsubjectBox.lastChild.textContent);
              }

              function checkHiddenLabels() {
                if ((expandedfromLabel.style.minWidth == "0px") || (expandedfromLabel.style.minWidth == "")) {
                  expandedfromRow.style.marginLeft ="-2px";
                  if ((messageHeader.getAttribute("compact") == "compact") && (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedsubjectRow.style.paddingLeft ="1.2em";
                  } else {
                    expandedsubjectRow.style.paddingLeft ="0px";
                  }
                } else {
                  expandedfromRow.style.marginLeft ="4px";
                  expandedsubjectRow.style.paddingLeft ="0px";
                }
              }

              function moveExpandedtagsBox() {
                if ((messageHeader.getAttribute("compact") == "compact") &&
                    (messageHeader.getAttribute("singleline") != "singleline") &&
                    (messageHeader.getAttribute("movetags") == "movetags")) {
                  dateLabel.insertAdjacentElement("beforebegin", expandedtagsBox);
                  dateLabel.style.marginLeft ="0px";
                  expandedtagsBox.style.marginLeft ="auto";
                  expandedtagsBox.style.maxHeight ="1.6em";
                  expandedsubjectBox.style.flexBasis = "33%";
                } else if ((messageHeader.getAttribute("compact") != "compact") ||
                           (messageHeader.getAttribute("singleline") == "singleline") ||
                           (messageHeader.getAttribute("movetags") != "movetags")) {
                  expandedtagsRow.insertAdjacentElement("beforeend", expandedtagsBox);
                  dateLabel.style.marginLeft ="auto";
                  expandedtagsBox.style.marginLeft ="0px";
                  expandedtagsBox.style.maxHeight ="none";
                  expandedsubjectBox.style.flexBasis = "unset";
                }
              }

              function checkOthers() {
                if (headerViewAllHeaders.getAttribute("checked") == "true") {
                  compactHeadersViewAll.setAttribute("checked", true);
                } else {
                  compactHeadersViewAll.setAttribute("checked", false);
                }
                if (messageHeader.getAttribute("compact") == "compact") {
                  expandedtoLabel.style.minWidth = "fit-content";
                  expandedccLabel.style.minWidth = "fit-content";
                  expandedcontentBaseLabel.style.minWidth = "fit-content";
                }
                if (messageHeader.getAttribute("compact") == "compact") {
                  try {
                    expandedccBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", doToggle, { once: true });
                  } catch (e) {};
                }
                if (messageHeader.getAttribute("compact") == "compact") {
                  try {
                    expandedtoBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", doToggle, { once: true });
                  } catch (e) {};
                }
              }
              checkLines();
              markToolbar();
              checkToCcHeaders();
              checkOthers();
              checkHeaders();
              ExtensionSupport.unregisterWindowListener("compactHeadersListener");
              //browser.setAttribute("chActive", false);
              console.debug("all checked");
            },
          });
        },
      },
    };
  }

  onShutdown(isAppShutdown) {
  if (isAppShutdown) return;

  for (let window of Services.wm.getEnumerator("mail:3pane")) {
    uninstall();
  }

  for (let window of Services.wm.getEnumerator("mail:messageWindow")) {
    uninstall();
  }

  function uninstall() {
    let browser = gTabmail.tabInfo[0].browser;
    let aboutMessage = browser.getRootNode();

    let msgHeaderView = aboutMessage.getElementById("msgHeaderView");
    if (msgHeaderView) msgHeaderView.removeAttribute("style");

    let messageHeader = aboutMessage.getElementById("messageHeader");
    if (messageHeader) {
      var i;
      for (i = 1; i < messageHeader.childElementCount; i++) {
        messageHeader.children[i].setAttribute("persist", "style");
        messageHeader.children[i].removeAttribute("style");
      }
      messageHeader.removeAttribute("compact");
      messageHeader.removeAttribute("style");
      messageHeader.removeEventListener("dblclick", doToggle);
    }

    let headerViewToolbar = aboutMessage.getElementById("header-view-toolbar");
    if (headerViewToolbar) headerViewToolbar.removeAttribute("style");
    if (headerViewToolbar) headerViewToolbar.removeEventListener("dblclick", stopDblclick, true);

    let expandedfromRow = aboutMessage.getElementById("expandedfromRow");
    if (expandedfromRow) expandedfromRow.style.marginLeft ="0px";
    if (expandedfromRow) expandedfromRow.style.flex="inherit";
    if (expandedfromRow) expandedfromRow.removeAttribute("style");

    let expandedfromLabel = aboutMessage.getElementById("expandedfromLabel");
    if (expandedfromLabel) expandedfromLabel.removeAttribute("style");

    let expandedfromBox = aboutMessage.getElementById("expandedfromBox");
    if (expandedfromBox) expandedfromBox.removeAttribute("style");

    let headerViewToolbox = aboutMessage.getElementById("header-view-toolbox");
    if (headerViewToolbox) headerViewToolbox.removeAttribute("style");

    let expandedsubjectRow = aboutMessage.getElementById("expandedsubjectRow");
    if (expandedsubjectRow) expandedsubjectRow.style.paddingLeft ="0px";
    if (expandedsubjectRow) expandedsubjectRow.removeAttribute("style");

    let expandedsubjectBox = aboutMessage.getElementById("expandedsubjectBox");
    if (expandedsubjectBox) expandedsubjectBox.removeAttribute("style");
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("dblclick", stopDblclick, true);
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("contextmenu", stopContext, true);

    let expandedcontentBaseBox = aboutMessage.getElementById("expandedcontent-baseBox");
    if (expandedcontentBaseBox) expandedcontentBaseBox.removeEventListener("contextmenu", stopContext, true);

    let expandedmessageIdBox = aboutMessage.getElementById("expandedmessage-idBox");
    if (expandedmessageIdBox) expandedmessageIdBox.removeEventListener("contextmenu", stopContext, true);

    let expandednewsgroupsBox = aboutMessage.getElementById("expandednewsgroupsBox");
    if (expandednewsgroupsBox) expandednewsgroupsBox.removeEventListener("contextmenu", stopContext, true);

    let expandedinReplyToBox = aboutMessage.getElementById("expandedin-reply-toBox");
    if (expandedinReplyToBox) expandedinReplyToBox.removeEventListener("contextmenu", stopContext, true);

    let expandedreferencesBox = aboutMessage.getElementById("expandedreferencesBox");
    if (expandedreferencesBox) expandedreferencesBox.removeEventListener("contextmenu", stopContext, true);

    //let compactHeadersHideHeaders = aboutMessage.getElementById("compactHeadersHideHeaders");
    //if (compactHeadersHideHeaders) compactHeadersHideHeaders.remove();

    //let compactHeadersSeparator2 = aboutMessage.getElementById("compactHeadersSeparator2");
    //if (compactHeadersSeparator2) compactHeadersSeparator2.remove();

    //let compactHeadersHideHeaders2 = aboutMessage.getElementById("compactHeadersHideHeaders2");
    //if (compactHeadersHideHeaders2) compactHeadersHideHeaders2.remove();

    let compactHeadersViewAll = aboutMessage.getElementById("compactHeadersViewAll");
    if (compactHeadersViewAll) compactHeadersViewAll.remove();
    let compactHeadersPopup = aboutMessage.getElementById("compactHeadersPopup");
    if (compactHeadersPopup) compactHeadersPopup.remove();
    let compactHeadersButton = aboutMessage.getElementById("compactHeadersButton");
    if (compactHeadersButton) compactHeadersButton.remove();
    let compactHeadersBox = aboutMessage.getElementById("compactHeadersBox");
    if (compactHeadersBox) compactHeadersBox.remove();

    let expandedtoRow = aboutMessage.getElementById("expandedtoRow");
    if (expandedtoRow) expandedtoRow.removeAttribute("style");
    let expandedccRow = aboutMessage.getElementById("expandedccRow");
    if (expandedccRow) expandedccRow.removeAttribute("style");
    let expandedcontentBaseRow = aboutMessage.getElementById("expandedcontent-baseRow");
    if (expandedcontentBaseRow) expandedcontentBaseRow.removeAttribute("style");
    let expandednewsgroupsRow = aboutMessage.getElementById("expandednewsgroupsRow");

    let headerSubjectSecurityContainer = aboutMessage.getElementById("headerSubjectSecurityContainer");
    let headerSenderToolbarContainer = aboutMessage.getElementById("headerSenderToolbarContainer");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
    if (expandedtoRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedtoRow);
    if (expandedccRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedccRow);
    if (expandednewsgroupsRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandednewsgroupsRow);
    if (expandedcontentBaseRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedcontentBaseRow);
    if (headerSubjectSecurityContainer) headerSubjectSecurityContainer.removeAttribute("style");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.removeAttribute("style");

    let expandedccBox = aboutMessage.getElementById("expandedccBox");
    if (expandedccBox) expandedccBox.removeAttribute("style");

    let expandedtoLabel = aboutMessage.getElementById("expandedtoLabel");
    if (expandedtoLabel) expandedtoLabel.removeAttribute("style");
    let expandedccLabel = aboutMessage.getElementById("expandedccLabel");
    if (expandedccLabel) expandedccLabel.removeAttribute("style");
    let expandedcontentBaseLabel = aboutMessage.getElementById("expandedcontent-baseLabel");
    if (expandedcontentBaseLabel) expandedcontentBaseLabel.removeAttribute("style");

    let dateLabel = aboutMessage.getElementById("dateLabel");
    let expandedtoBox = aboutMessage.getElementById("expandedtoBox");
    if (expandedtoBox) expandedtoBox.insertAdjacentElement("afterend", dateLabel);
    if (expandedtoBox) expandedtoBox.removeAttribute("style");

    if (dateLabel) dateLabel.removeAttribute("style");
    if (dateLabel) dateLabel.removeEventListener("dblclick", stopDblclick, true);
    if (dateLabel) dateLabel.removeEventListener("contextmenu", stopContext, true);

    let dateLabelSubject = aboutMessage.getElementById("dateLabelSubject");
    if (dateLabelSubject) dateLabelSubject.removeAttribute("style");

    let encryptionTechBtn = aboutMessage.getElementById("encryptionTechBtn");
    if (encryptionTechBtn) encryptionTechBtn.removeAttribute("style");

    let singleMessage = aboutMessage.getElementById("singleMessage");
    if (singleMessage) singleMessage.removeAttribute("style");

    let expandedtagsBox = aboutMessage.getElementById("expandedtagsBox");
    let expandedtagsRow = aboutMessage.getElementById("expandedtagsRow");
    if (expandedtagsRow) expandedtagsRow.insertAdjacentElement("afterbegin", expandedtagsBox);
    if (expandedtagsBox) expandedtagsBox.style.marginLeft ="0px";
  }
  //ExtensionSupport.unregisterWindowListener("compactHeadersListener");
  console.debug("Compact Headers disabled");
  }
};
