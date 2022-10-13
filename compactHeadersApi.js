var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { ExtensionSupport } = ChromeUtils.import("resource:///modules/ExtensionSupport.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);

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
        async compactHeaders() {
          ExtensionSupport.registerWindowListener("compactHeadersListener", {
            chromeURLs: [
              "chrome://messenger/content/messenger.xhtml",
              "chrome://messenger/content/messageWindow.xhtml",
            ],
            onLoadWindow(window) {
              let msgHeaderView = window.document.getElementById("msgHeaderView");
              let messageHeader = window.document.getElementById("messageHeader");
              let messagepanebox = window.document.getElementById("messagepanebox");

              let headerViewToolbox = window.document.getElementById("header-view-toolbox");
              let headerViewToolbar = window.document.getElementById("header-view-toolbar");
              let otherActionsBox = window.document.getElementById("otherActionsBox");
              let mailContext = window.document.getElementById("mailContext");
              let menu_HeadersPopup = window.document.getElementById("menu_HeadersPopup");

              let compactHeadersPopup = window.document.createXULElement("menupopup");
              compactHeadersPopup.id = "compactHeadersPopup";
              msgHeaderView.setAttribute("context", "compactHeadersPopup");

              let compactHeadersSingleLine = window.document.createXULElement("menuitem");
              compactHeadersSingleLine.id = "compactHeadersSingleLine";
              compactHeadersSingleLine.setAttribute("type", "checkbox");
              compactHeadersSingleLine.setAttribute("label", "Single Line Headers");
              compactHeadersSingleLine.setAttribute("tooltiptext", "Displays compact headers on a single line");
              compactHeadersSingleLine.addEventListener("command", () => setLines());

              let compactHeadersHideToolbar = window.document.createXULElement("menuitem");
              compactHeadersHideToolbar.id = "compactHeadersHideToolbar";
              compactHeadersHideToolbar.setAttribute("type", "checkbox");
              compactHeadersHideToolbar.setAttribute("label", "Hide Header Toolbar");
              compactHeadersHideToolbar.setAttribute("tooltiptext", "Hides the header toolbar");
              compactHeadersHideToolbar.addEventListener("command", () => toggleToolbar());

              let compactHeadersMoveToHeader = window.document.createXULElement("menuitem");
              compactHeadersMoveToHeader.id = "compactHeadersMoveToHeader";
              compactHeadersMoveToHeader.setAttribute("type", "checkbox");
              compactHeadersMoveToHeader.setAttribute("label", "Show To Header");
              compactHeadersMoveToHeader.setAttribute("tooltiptext", "Shows the To header on the first line in double line mode");
              compactHeadersMoveToHeader.addEventListener("command", () => toggleToHeader());

              let compactHeadersMoveCcHeader = window.document.createXULElement("menuitem");
              compactHeadersMoveCcHeader.id = "compactHeadersMoveCcHeader";
              compactHeadersMoveCcHeader.setAttribute("type", "checkbox");
              compactHeadersMoveCcHeader.setAttribute("label", "Show Cc Header");
              compactHeadersMoveCcHeader.setAttribute("tooltiptext", "Shows the Cc header on the first line in double line mode");
              compactHeadersMoveCcHeader.addEventListener("command", () => toggleCcHeader());

              let compactHeadersViewAll = window.document.createXULElement("menuitem");
              compactHeadersViewAll.id = "compactHeadersViewAll";
              compactHeadersViewAll.setAttribute("type", "radio");
              compactHeadersViewAll.setAttribute("label", "View All Headers");
              compactHeadersViewAll.setAttribute("name", "compactHeaderViewGroup");
              compactHeadersViewAll.addEventListener("command", () => markHeaders());

              let compactHeadersViewNormal = window.document.createXULElement("menuitem");
              compactHeadersViewNormal.id = "compactHeadersViewNormal";
              compactHeadersViewNormal.setAttribute("type", "radio");
              compactHeadersViewNormal.setAttribute("label", "View Normal Headers");
              compactHeadersViewNormal.setAttribute("name", "compactHeaderViewGroup");
              compactHeadersViewNormal.addEventListener("command", () => markHeaders());

              let compactHeadersBox = window.document.createXULElement("vbox");
              let compactHeadersButton = window.document.createXULElement("button");
              compactHeadersBox.id = "compactHeadersBox";
              compactHeadersBox.setAttribute("style","margin-inline: -4px -5px; position: relative; z-index: 1;");
              compactHeadersButton.id = "compactHeadersButton";
              let compactHeadersLocale = window.navigator.language;
              if (compactHeadersLocale != "de") compactHeadersButton.setAttribute("accesskey", "D");
              compactHeadersButton.setAttribute("style","-moz-user-focus: ignore;\
                border: 4px solid transparent; background: transparent; margin: 0px -2px 0px 2px;\
                box-shadow: none; min-width: 0px; min-height: 0px; padding: 0px !important;\
                -moz-appearance: none; color: currentColor; -moz-context-properties: fill; fill: currentColor;");

              let compactHeadersSeparator = window.document.createXULElement("menuseparator");
              compactHeadersSeparator.id = "compactHeadersSeparator";

              let compactHeadersHideHeaders = window.document.createXULElement("menuitem");
              compactHeadersHideHeaders.id = "compactHeadersHideHeaders";
              compactHeadersHideHeaders.addEventListener("command", () => hideHeaders());

              let compactHeadersSeparator2 = window.document.createXULElement("menuseparator");
              compactHeadersSeparator2.id = "compactHeadersSeparator2";

              let compactHeadersSeparator3 = window.document.createXULElement("menuseparator");
              compactHeadersSeparator3.id = "compactHeadersSeparator3";

              let compactHeadersHideHeaders2 = window.document.createXULElement("menuitem");
              compactHeadersHideHeaders2.id = "compactHeadersHideHeaders2";
              compactHeadersHideHeaders2.addEventListener("command", () => hideHeaders());

              let expandedfromRow = window.document.getElementById("expandedfromRow");
              let expandedfromBox = window.document.getElementById("expandedfromBox");
              expandedfromBox.firstChild.nextSibling.style.flexWrap = "nowrap";
              expandedfromBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedfromLabel = window.document.getElementById("expandedfromLabel");
              if (expandedfromLabel) expandedfromLabel.setAttribute("style", "width: 4em;");

              let expandedtoRow = window.document.getElementById("expandedtoRow");
              let expandedtoBox = window.document.getElementById("expandedtoBox");
              expandedtoBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedtoLabel = window.document.getElementById("expandedtoLabel");

              let expandedccRow = window.document.getElementById("expandedccRow");
              let expandedccBox = window.document.getElementById("expandedccBox");
              expandedccBox.firstChild.nextSibling.style.minWidth = "inherit";
              let expandedccLabel = window.document.getElementById("expandedccLabel");

              let expandedsubjectRow = window.document.getElementById("expandedsubjectRow");
              if (expandedsubjectRow) expandedsubjectRow.setAttribute("style", "overflow: hidden; margin-block: auto;");

              let expandedsubjectBox = window.document.getElementById("expandedsubjectBox");
              if (expandedsubjectBox) expandedsubjectBox.addEventListener("dblclick", stopDblclick, true);
              if (expandedsubjectBox) expandedsubjectBox.addEventListener("contextmenu", stopContext, true);

              let expandedsubjectLabel = window.document.getElementById("expandedsubjectLabel");
              if (expandedsubjectLabel) expandedsubjectLabel.addEventListener("mouseover", () => setTooltip());
              if (expandedsubjectLabel) expandedsubjectLabel.style.marginBlock = "auto";

              let dateLabel = window.document.getElementById("dateLabel");
              if (dateLabel) dateLabel.setAttribute("style", "margin: auto 6px auto auto; min-width: fit-content; padding-inline-start: 1em;");
              if (dateLabel) dateLabel.addEventListener("dblclick", stopDblclick, true);
              if (dateLabel) dateLabel.addEventListener("contextmenu", stopContext, true);
              let dateLabelSubject = window.document.getElementById("dateLabelSubject");

              let encryptionTechBtn = window.document.getElementById("encryptionTechBtn");
              if (encryptionTechBtn) encryptionTechBtn.setAttribute("style", "margin-block: -4px;");

              let newsgroupsHeading = window.document.getElementById("newsgroupsHeading");
              if (newsgroupsHeading) newsgroupsHeading.setAttribute("style", "margin-block: auto;");

              let headerSenderToolbarContainer = window.document.getElementById("headerSenderToolbarContainer");
              if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.display = "flex";
              if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.flexWrap = "unset";
              let headerSubjectSecurityContainer = window.document.getElementById("headerSubjectSecurityContainer");

              let headerHideLabels = window.document.getElementById("headerHideLabels");
              if (headerHideLabels) headerHideLabels.addEventListener("command", () => checkHiddenLabels());

              let expandedcontentBaseBox = window.document.getElementById("expandedcontent-baseBox");
              if (expandedcontentBaseBox) expandedcontentBaseBox.addEventListener("contextmenu", stopContext, true);

              let expandedmessageIdBox = window.document.getElementById("expandedmessage-idBox");
              if (expandedmessageIdBox) expandedmessageIdBox.addEventListener("contextmenu", stopContext, true);

              let expandedinReplyToBox = window.document.getElementById("expandedin-reply-toBox");
              if (expandedinReplyToBox) expandedinReplyToBox.addEventListener("contextmenu", stopContext, true);

              let expandedreferencesBox = window.document.getElementById("expandedreferencesBox");
              if (expandedreferencesBox) expandedreferencesBox.addEventListener("contextmenu", stopContext, true);

              let expandednewsgroupsBox = window.document.getElementById("expandednewsgroupsBox");
              if (expandednewsgroupsBox) expandednewsgroupsBox.addEventListener("contextmenu", stopContext, true);

              let singleMessage = window.document.getElementById("singleMessage");
              if (singleMessage) singleMessage.setAttribute("style", "background-color: buttonface !important");

              checkHeaders();
              markToolbar();

              compactHeadersPopup.append(compactHeadersSingleLine);
              compactHeadersPopup.append(compactHeadersSeparator3);
              compactHeadersPopup.append(compactHeadersMoveToHeader);
              compactHeadersPopup.append(compactHeadersMoveCcHeader);
              compactHeadersPopup.append(compactHeadersHideToolbar);
              compactHeadersPopup.append(compactHeadersSeparator);
              compactHeadersPopup.append(compactHeadersViewAll);
              compactHeadersPopup.append(compactHeadersViewNormal);
              window.mainPopupSet.append(compactHeadersPopup);

              mailContext.append(compactHeadersHideHeaders);
              menu_HeadersPopup.append(compactHeadersSeparator2);
              menu_HeadersPopup.append(compactHeadersHideHeaders2);

              compactHeadersButton.addEventListener("command", () => toggleHeaders());
              compactHeadersBox.append(compactHeadersButton);
              expandedfromRow.setAttribute("style", "align-items: center; margin: auto; overflow: hidden;");
              expandedfromRow.insertAdjacentElement("afterbegin", compactHeadersBox);

              doToggle = () => toggleHeaders();
              messageHeader.addEventListener("dblclick", doToggle);
              if (headerViewToolbar) headerViewToolbar.addEventListener("dblclick", stopDblclick, true);

              function singleLine() {
                headerViewToolbox.setAttribute("style", "display: none;");
                if (messageHeader.getAttribute("compact") == "compact") {
                  expandedfromRow.insertAdjacentElement("beforebegin", headerSubjectSecurityContainer);
                  headerSubjectSecurityContainer.setAttribute("style", "max-width: 75%; height: 100%; z-index: 1; padding-inline-start: 2em;\
                    margin-block: -1em; margin-inline-start: -2em; background: linear-gradient(to right,transparent,buttonface 2em) !important;");
                  expandedfromRow.style.flex="auto";
                  expandedtoRow.setAttribute("style", "display: none;");
                  expandedccRow.setAttribute("style", "display: none;");
                } else {
                  doubleLine();
                }
              }

              function doubleLine() {
                msgHeaderView.removeAttribute("style");
                headerViewToolbox.setAttribute("style", "margin-block: -1px;");
                headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
                expandedfromRow.style.flex="inherit";
                expandedtoRow.removeAttribute("style");
                expandedccRow.removeAttribute("style");
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

              function hideHeaders() {
                if (messageHeader.getAttribute("hideheaders") == "hideheaders") {
                  compactHeadersHideHeaders.setAttribute("label", "Hide Headers");
                  compactHeadersHideHeaders2.setAttribute("label", "Hide Headers");
                  msgHeaderView.setAttribute("style", "background: buttonface !important;");
                  messageHeader.removeAttribute("hideheaders");
                } else {
                  compactHeadersHideHeaders.setAttribute("label", "Show Headers");
                  compactHeadersHideHeaders2.setAttribute("label", "Show Headers");
                  msgHeaderView.setAttribute("style", "margin-top: -1px; visibility: collapse;");
                  messageHeader.setAttribute("hideheaders", "hideheaders");
                }
              }

              function checkHeaders() {
                checkHiddenLabels();
                setDateLabelSubject();
                messageHeader.setAttribute("persist", "compact; showall; singleline; hidetoolbar; hideheaders; movetoheader; moveccheader");
                if (messageHeader.getAttribute("showall") == "showall") {
                  compactHeadersViewAll.setAttribute("checked", true);
                } else {
                  compactHeadersViewNormal.setAttribute("checked", true);
                }

                if (messageHeader.getAttribute("hideheaders") == "hideheaders") {
                  compactHeadersHideHeaders.setAttribute("label", "Show Headers");
                  compactHeadersHideHeaders2.setAttribute("label", "Show Headers");
                  msgHeaderView.setAttribute("style", "margin-top: -1px; visibility: collapse;");
                } else {
                  compactHeadersHideHeaders.setAttribute("label", "Hide Headers");
                  compactHeadersHideHeaders2.setAttribute("label", "Hide Headers");
                  msgHeaderView.setAttribute("style", "background: buttonface !important;");
                }

                if (messageHeader.getAttribute("compact") == "compact") {
                  if (expandedfromBox) expandedfromBox.setAttribute("style", "overflow: hidden; min-width: 250%; margin-inline-end: 1.6em;");
                  checkHiddenLabels();
                  checkToolbar();
                  compactHeadersButton.setAttribute("image", "chrome://messenger/skin/overrides/arrow-right-12.svg");
                  compactHeadersBox.setAttribute("style","margin-inline: -4px -18px; position: relative; z-index: 1;");
                  compactHeadersButton.setAttribute("tooltiptext", "Show Details");
                  var i;
                  for (i = 1; i < messageHeader.childElementCount; i++) {
                    messageHeader.children[i].setAttribute("persist", "style");
                    messageHeader.children[i].setAttribute("style", "display: none;");
                    if (messageHeader.getAttribute("singleline") != "singleline") headerSubjectSecurityContainer.removeAttribute("style");
                  }
                  if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow: hidden; -webkit-line-clamp: 1; max-width: fit-content;");

                  headerViewToolbox.style.flex="auto";
                  expandedfromRow.insertAdjacentElement("beforebegin", expandedccRow);
                  expandedccRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                    margin-block: -8px; padding-block: 8px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 2; flex: inherit;");
                  expandedccBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                  expandedfromRow.insertAdjacentElement("beforebegin", expandedtoRow);
                  expandedtoRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                    margin-block: -8px; padding-block: 8px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 1; flex: inherit;");
                  expandedtoBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                  if ((messageHeader.getAttribute("moveccheader") != "moveccheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedccRow.style.display = "none";
                  }
                  if ((messageHeader.getAttribute("movetoheader") != "movetoheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedtoRow.style.display = "none";
                  }
                } else {
                  if (expandedfromBox) expandedfromBox.removeAttribute("style");
                  checkHiddenLabels();
                  checkToolbar();
                  compactHeadersButton.setAttribute("image", "chrome://messenger/skin/overrides/arrow-down-12.svg");
                  compactHeadersBox.setAttribute("style","margin-inline: -4px -18px; position: relative; z-index: 1;");
                  compactHeadersButton.setAttribute("tooltiptext", "Hide Details");
                  var i;
                  for (i = 1; i < messageHeader.childElementCount; i++) {
                    messageHeader.children[i].setAttribute("persist", "style");
                    messageHeader.children[i].removeAttribute("style");
                    headerSubjectSecurityContainer.removeAttribute("style");
                  }
                  if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow-x: hidden; -webkit-line-clamp: 3; max-width: fit-content;");
                  doubleLine();

                  headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedccRow);
                  expandedccRow.removeAttribute("style");
                  expandedccBox.removeAttribute("style");
                  headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedtoRow);
                  expandedtoRow.removeAttribute("style");
                  expandedtoBox.removeAttribute("style");
                }
              }

              function markHeaders() {
                if (compactHeadersViewAll.getAttribute("checked") == "true") {
                  messageHeader.setAttribute("showall", "showall");
                  if (messageHeader.getAttribute("compact") != "compact") window.MsgViewAllHeaders();
                } else {
                  messageHeader.removeAttribute("showall");
                  if (messageHeader.getAttribute("compact") != "compact") window.MsgViewNormalHeaders();
                }
              }

              function setDateLabelSubject() {
                expandedsubjectBox.insertAdjacentElement("afterend", dateLabel);
                dateLabelSubject.setAttribute("style", "display: none;");
              }

              function toggleHeaders() {
                setDateLabelSubject();
                switch(messageHeader.getAttribute("compact")) {
                case "compact": messageHeader.removeAttribute("compact");
                  if (expandedfromBox) expandedfromBox.removeAttribute("style");
                  checkHiddenLabels();
                  checkToolbar();
                  compactHeadersButton.setAttribute("image", "chrome://messenger/skin/overrides/arrow-down-12.svg");
                  compactHeadersBox.setAttribute("style","margin-inline: -4px -18px; position: relative; z-index: 1;");
                  compactHeadersButton.setAttribute("tooltiptext", "Hide Details");
                  if (messageHeader.getAttribute("showall") == "showall") window.MsgViewAllHeaders();
                  else window.MsgViewNormalHeaders();
                  var i;
                  for (i = 1; i < messageHeader.childElementCount; i++) {
                    messageHeader.children[i].setAttribute("persist", "style");
                    messageHeader.children[i].removeAttribute("style");
                    headerSubjectSecurityContainer.removeAttribute("style");
                  }
                  if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow-x: hidden; -webkit-line-clamp: 3; max-width: fit-content;");
                  doubleLine();

                  headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedccRow);
                  expandedccRow.removeAttribute("style");
                  expandedccBox.removeAttribute("style");
                  headerSubjectSecurityContainer.insertAdjacentElement("afterend", expandedtoRow);
                  expandedtoRow.removeAttribute("style");
                  expandedtoBox.removeAttribute("style");
                break;
                default: messageHeader.setAttribute("compact", "compact");
                  if (expandedfromBox) expandedfromBox.setAttribute("style", "overflow: hidden; min-width: 250%; margin-inline-end: 1.6em;");
                  checkHiddenLabels();
                  checkToolbar();
                  compactHeadersButton.setAttribute("image", "chrome://messenger/skin/overrides/arrow-right-12.svg");
                  compactHeadersBox.setAttribute("style","margin-inline: -4px -18px; position: relative; z-index: 1;");
                  compactHeadersButton.setAttribute("tooltiptext", "Show Details");
                  window.MsgViewNormalHeaders();
                  var i;
                  for (i = 1; i < messageHeader.childElementCount; i++) {
                    messageHeader.children[i].setAttribute("persist", "style");
                    messageHeader.children[i].setAttribute("style", "display: none;");
                    if (messageHeader.getAttribute("singleline") != "singleline") headerSubjectSecurityContainer.removeAttribute("style");
                  }
                  if (expandedsubjectBox) expandedsubjectBox.setAttribute("style", "overflow: hidden; -webkit-line-clamp: 1; max-width: fit-content;");
                  if (messageHeader.getAttribute("singleline") == "singleline") singleLine();
                  else doubleLine();

                  headerViewToolbox.style.flex="auto";
                  expandedfromRow.insertAdjacentElement("beforebegin", expandedccRow);
                  expandedccRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                    margin-block: -8px; padding-block: 8px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 2; flex: inherit;");
                  expandedccBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                  expandedfromRow.insertAdjacentElement("beforebegin", expandedtoRow);
                  expandedtoRow.setAttribute("style", "background: linear-gradient(to right,transparent,buttonface 2em) !important;\
                    margin-block: -8px; padding-block: 8px; margin-inline-start: -2em; padding-inline-start: 2.4em; z-index: 1; flex: inherit;");
                  expandedtoBox.setAttribute("style", "max-block-size: 1.5em; min-height:20px; overflow: hidden; min-width: 250%; max-height: 1.5em; margin-inline-end: 1.6em;");
                  if ((messageHeader.getAttribute("moveccheader") != "moveccheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedccRow.style.display = "none";
                  }
                  if ((messageHeader.getAttribute("movetoheader") != "movetoheader") || (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedtoRow.style.display = "none";
                  }
                }
              }

              function checkToolbar() {
                if (messageHeader.getAttribute("hidetoolbar") == "hidetoolbar") {
                  hideToolbar();
                } else {
                  hideToolbar();
                  headerViewToolbar.setAttribute("style", "margin: -8px -1em -8px -2em; padding: 6px 1em 6px 2.2em ; position: relative;\
                    z-index: 3; background: linear-gradient(to right,transparent,buttonface 2em) !important; min-width: max-content;");
                }
              }

              function hideToolbar() {
                headerViewToolbar.setAttribute("style", "display: none;");
              }

              function showToolbar() {
                headerViewToolbar.setAttribute("style", "margin: -8px -1em -8px -2em; padding: 6px 1em 6px 2.2em ; position: relative;\
                  z-index: 3; background: linear-gradient(to right,transparent,buttonface 2em) !important; min-width: max-content;");
              }

              function toggleToHeader() {
                if (messageHeader.getAttribute("movetoheader") == "movetoheader") {
                  messageHeader.removeAttribute("movetoheader")
                } else {
                  messageHeader.setAttribute("movetoheader", "movetoheader")
                }
                checkHeaders();
              }

              function toggleCcHeader() {
                if (messageHeader.getAttribute("moveccheader") == "moveccheader") {
                  messageHeader.removeAttribute("moveccheader")
                } else {
                  messageHeader.setAttribute("moveccheader", "moveccheader")
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
                checkHeaders();
              }

              function setTooltip() {
                if (expandedsubjectLabel) expandedsubjectLabel.setAttribute("tooltiptext", expandedsubjectBox.lastChild.textContent);
              }

              function checkHiddenLabels() {
                if (expandedfromLabel.style.minWidth > "0px") {
                  expandedfromRow.style.marginLeft ="0px";
                  expandedfromBox.style.paddingLeft ="0px";
                  expandedsubjectRow.style.paddingLeft ="0px";
                } else {
                  expandedfromRow.style.marginLeft ="-6px";
                  if (xulAppInfo.OS == "WINNT" || xulAppInfo.OS == "Darwin") {
                    expandedfromBox.style.paddingLeft ="1.7em";
                  } else {
                    expandedfromBox.style.paddingLeft ="1.4em";
                  }
                  if ((messageHeader.getAttribute("compact") == "compact") && (messageHeader.getAttribute("singleline") == "singleline")) {
                    expandedsubjectRow.style.paddingLeft ="1.2em";
                  } else {
                    expandedsubjectRow.style.paddingLeft ="0px";
                  }
                }
              }

              messagepanebox.addEventListener('DOMContentLoaded', (event) => {
                checkHiddenLabels();
                checkLines();
                checkToCcHeaders();
                },
                { once: true }
              );

              messagepanebox.addEventListener('DOMContentLoaded', (event) => {
                if (messageHeader.getAttribute("compact") == "compact") {
                  expandedtoLabel.style.minWidth = "fit-content";
                  expandedccLabel.style.minWidth = "fit-content";
                }
                if (messageHeader.getAttribute("compact") == "compact") {
                  try {
                    expandedtoBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", doToggle);
                  } catch (e) {};
                } else {
                  try {
                    expandedtoBox.firstChild.nextSibling.lastChild.firstChild.removeEventListener("mousedown", doToggle);
                  } catch (e) {};
                }
                if (messageHeader.getAttribute("compact") == "compact") {
                  try {
                    expandedccBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", doToggle);
                  } catch (e) {};
                } else {
                  try {
                    expandedccBox.firstChild.nextSibling.lastChild.firstChild.removeEventListener("mousedown", doToggle);
                  } catch (e) {};
                }
              });
              console.debug("Compact Headers loaded");
            },
          });
        },
      },
    };
  }

  onShutdown(isAppShutdown) {
  if (isAppShutdown) return;

  for (let window of Services.wm.getEnumerator("mail:3pane")) {

    let msgHeaderView = window.document.getElementById("msgHeaderView");
    if (msgHeaderView) msgHeaderView.removeAttribute("style");

    let messageHeader = window.document.getElementById("messageHeader");
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

    let headerViewToolbar = window.document.getElementById("header-view-toolbar");
    if (headerViewToolbar) headerViewToolbar.removeAttribute("style");
    if (headerViewToolbar) headerViewToolbar.removeEventListener("dblclick", stopDblclick, true);

    let expandedfromRow = window.document.getElementById("expandedfromRow");
    if (expandedfromRow) expandedfromRow.style.marginLeft ="0px";
    if (expandedfromRow) expandedfromRow.style.flex="inherit";
    if (expandedfromRow) expandedfromRow.removeAttribute("style");

    let expandedfromLabel = window.document.getElementById("expandedfromLabel");
    if (expandedfromLabel) expandedfromLabel.removeAttribute("style");

    let expandedfromBox = window.document.getElementById("expandedfromBox");
    if (expandedfromBox) expandedfromBox.style.paddingLeft ="0px";
    if (expandedfromBox) expandedfromBox.removeAttribute("style");

    let headerViewToolbox = window.document.getElementById("header-view-toolbox");
    if (headerViewToolbox) headerViewToolbox.removeAttribute("style");

    let expandedsubjectRow = window.document.getElementById("expandedsubjectRow");
    if (expandedsubjectRow) expandedsubjectRow.style.paddingLeft ="0px";
    if (expandedsubjectRow) expandedsubjectRow.removeAttribute("style");

    let expandedsubjectBox = window.document.getElementById("expandedsubjectBox");
    if (expandedsubjectBox) expandedsubjectBox.removeAttribute("style");
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("dblclick", stopDblclick, true);
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("contextmenu", stopContext, true);

    let expandedcontentBaseBox = window.document.getElementById("expandedcontent-baseBox");
    if (expandedcontentBaseBox) expandedcontentBaseBox.removeEventListener("contextmenu", stopContext, true);

    let expandedmessageIdBox = window.document.getElementById("expandedmessage-idBox");
    if (expandedmessageIdBox) expandedmessageIdBox.removeEventListener("contextmenu", stopContext, true);

    let expandednewsgroupsBox = window.document.getElementById("expandednewsgroupsBox");
    if (expandednewsgroupsBox) expandednewsgroupsBox.removeEventListener("contextmenu", stopContext, true);

    let expandedinReplyToBox = window.document.getElementById("expandedin-reply-toBox");
    if (expandedinReplyToBox) expandedinReplyToBox.removeEventListener("contextmenu", stopContext, true);

    let expandedreferencesBox = window.document.getElementById("expandedreferencesBox");
    if (expandedreferencesBox) expandedreferencesBox.removeEventListener("contextmenu", stopContext, true);

    let compactHeadersHideHeaders = window.document.getElementById("compactHeadersHideHeaders");
    if (compactHeadersHideHeaders) compactHeadersHideHeaders.remove();

    let compactHeadersSeparator2 = window.document.getElementById("compactHeadersSeparator2");
    if (compactHeadersSeparator2) compactHeadersSeparator2.remove();

    let compactHeadersHideHeaders2 = window.document.getElementById("compactHeadersHideHeaders2");
    if (compactHeadersHideHeaders2) compactHeadersHideHeaders2.remove();

    let compactHeadersViewAll = window.document.getElementById("compactHeadersViewAll");
    if (compactHeadersViewAll) compactHeadersViewAll.remove();
    let compactHeadersViewNormal = window.document.getElementById("compactHeadersViewNormal");
    if (compactHeadersViewNormal) compactHeadersViewNormal.remove();
    let compactHeadersPopup = window.document.getElementById("compactHeadersPopup");
    if (compactHeadersPopup) compactHeadersPopup.remove();
    let compactHeadersButton = window.document.getElementById("compactHeadersButton");
    if (compactHeadersButton) compactHeadersButton.remove();
    let compactHeadersBox = window.document.getElementById("compactHeadersBox");
    if (compactHeadersBox) compactHeadersBox.remove();

    let expandedtoRow = window.document.getElementById("expandedtoRow");
    if (expandedtoRow) expandedtoRow.removeAttribute("style");

    let expandedccRow = window.document.getElementById("expandedccRow");
    if (expandedccRow) expandedccRow.removeAttribute("style");

    let headerSubjectSecurityContainer = window.document.getElementById("headerSubjectSecurityContainer");
    let headerSenderToolbarContainer = window.document.getElementById("headerSenderToolbarContainer");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
    if (expandedtoRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedtoRow);
    if (expandedccRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedccRow);
    if (headerSubjectSecurityContainer) headerSubjectSecurityContainer.removeAttribute("style");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.removeAttribute("style");

    let expandedccBox = window.document.getElementById("expandedccBox");
    if (expandedccBox) expandedccBox.removeAttribute("style");

    let expandedtoLabel = window.document.getElementById("expandedtoLabel");
    if (expandedtoLabel) expandedtoLabel.removeAttribute("style");

    let expandedccLabel = window.document.getElementById("expandedccLabel");
    if (expandedccLabel) expandedccLabel.removeAttribute("style");

    let dateLabel = window.document.getElementById("dateLabel");
    let expandedtoBox = window.document.getElementById("expandedtoBox");
    if (expandedtoBox) expandedtoBox.insertAdjacentElement("afterend", dateLabel);
    if (expandedtoBox) expandedtoBox.removeAttribute("style");

    if (dateLabel) dateLabel.removeAttribute("style");
    if (dateLabel) dateLabel.removeEventListener("dblclick", stopDblclick, true);
    if (dateLabel) dateLabel.removeEventListener("contextmenu", stopContext, true);

    let dateLabelSubject = window.document.getElementById("dateLabelSubject");
    if (dateLabelSubject) dateLabelSubject.removeAttribute("style");

    let encryptionTechBtn = window.document.getElementById("encryptionTechBtn");
    if (encryptionTechBtn) encryptionTechBtn.removeAttribute("style");


    let singleMessage = window.document.getElementById("singleMessage");
    if (singleMessage) singleMessage.removeAttribute("style");
  }

  for (let window of Services.wm.getEnumerator("mail:messageWindow")) {

    let msgHeaderView = window.document.getElementById("msgHeaderView");
    if (msgHeaderView) msgHeaderView.removeAttribute("style");

    let messageHeader = window.document.getElementById("messageHeader");
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

    let headerViewToolbar = window.document.getElementById("header-view-toolbar");
    if (headerViewToolbar) headerViewToolbar.removeAttribute("style");
    if (headerViewToolbar) headerViewToolbar.removeEventListener("dblclick", stopDblclick, true);

    let expandedfromRow = window.document.getElementById("expandedfromRow");
    if (expandedfromRow) expandedfromRow.style.marginLeft ="0px";
    if (expandedfromRow) expandedfromRow.style.flex="inherit";
    if (expandedfromRow) expandedfromRow.removeAttribute("style");

    let expandedfromLabel = window.document.getElementById("expandedfromLabel");
    if (expandedfromLabel) expandedfromLabel.removeAttribute("style");

    let expandedfromBox = window.document.getElementById("expandedfromBox");
    if (expandedfromBox) expandedfromBox.style.paddingLeft ="0px";
    if (expandedfromBox) expandedfromBox.removeAttribute("style");

    let headerViewToolbox = window.document.getElementById("header-view-toolbox");
    if (headerViewToolbox) headerViewToolbox.removeAttribute("style");

    let expandedsubjectRow = window.document.getElementById("expandedsubjectRow");
    if (expandedsubjectRow) expandedsubjectRow.style.paddingLeft ="0px";
    if (expandedsubjectRow) expandedsubjectRow.removeAttribute("style");

    let expandedsubjectBox = window.document.getElementById("expandedsubjectBox");
    if (expandedsubjectBox) expandedsubjectBox.removeAttribute("style");
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("dblclick", stopDblclick, true);
    if (expandedsubjectBox) expandedsubjectBox.removeEventListener("contextmenu", stopContext, true);

    let expandedcontentBaseBox = window.document.getElementById("expandedcontent-baseBox");
    if (expandedcontentBaseBox) expandedcontentBaseBox.removeEventListener("contextmenu", stopContext, true);

    let expandedmessageIdBox = window.document.getElementById("expandedmessage-idBox");
    if (expandedmessageIdBox) expandedmessageIdBox.removeEventListener("contextmenu", stopContext, true);

    let expandednewsgroupsBox = window.document.getElementById("expandednewsgroupsBox");
    if (expandednewsgroupsBox) expandednewsgroupsBox.removeEventListener("contextmenu", stopContext, true);

    let expandedinReplyToBox = window.document.getElementById("expandedin-reply-toBox");
    if (expandedinReplyToBox) expandedinReplyToBox.removeEventListener("contextmenu", stopContext, true);

    let expandedreferencesBox = window.document.getElementById("expandedreferencesBox");
    if (expandedreferencesBox) expandedreferencesBox.removeEventListener("contextmenu", stopContext, true);

    let compactHeadersHideHeaders = window.document.getElementById("compactHeadersHideHeaders");
    if (compactHeadersHideHeaders) compactHeadersHideHeaders.remove();

    let compactHeadersSeparator2 = window.document.getElementById("compactHeadersSeparator2");
    if (compactHeadersSeparator2) compactHeadersSeparator2.remove();

    let compactHeadersHideHeaders2 = window.document.getElementById("compactHeadersHideHeaders2");
    if (compactHeadersHideHeaders2) compactHeadersHideHeaders2.remove();

    let compactHeadersViewAll = window.document.getElementById("compactHeadersViewAll");
    if (compactHeadersViewAll) compactHeadersViewAll.remove();
    let compactHeadersViewNormal = window.document.getElementById("compactHeadersViewNormal");
    if (compactHeadersViewNormal) compactHeadersViewNormal.remove();
    let compactHeadersPopup = window.document.getElementById("compactHeadersPopup");
    if (compactHeadersPopup) compactHeadersPopup.remove();
    let compactHeadersButton = window.document.getElementById("compactHeadersButton");
    if (compactHeadersButton) compactHeadersButton.remove();
    let compactHeadersBox = window.document.getElementById("compactHeadersBox");
    if (compactHeadersBox) compactHeadersBox.remove();

    let expandedtoRow = window.document.getElementById("expandedtoRow");
    if (expandedtoRow) expandedtoRow.removeAttribute("style");

    let expandedccRow = window.document.getElementById("expandedccRow");
    if (expandedccRow) expandedccRow.removeAttribute("style");

    let headerSubjectSecurityContainer = window.document.getElementById("headerSubjectSecurityContainer");
    let headerSenderToolbarContainer = window.document.getElementById("headerSenderToolbarContainer");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
    if (expandedtoRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedtoRow);
    if (expandedccRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedccRow);
    if (headerSubjectSecurityContainer) headerSubjectSecurityContainer.removeAttribute("style");
    if (headerSenderToolbarContainer) headerSenderToolbarContainer.removeAttribute("style");

    let expandedccBox = window.document.getElementById("expandedccBox");
    if (expandedccBox) expandedccBox.removeAttribute("style");

    let expandedtoLabel = window.document.getElementById("expandedtoLabel");
    if (expandedtoLabel) expandedtoLabel.removeAttribute("style");

    let expandedccLabel = window.document.getElementById("expandedccLabel");
    if (expandedccLabel) expandedccLabel.removeAttribute("style");

    let dateLabel = window.document.getElementById("dateLabel");
    let expandedtoBox = window.document.getElementById("expandedtoBox");
    if (expandedtoBox) expandedtoBox.insertAdjacentElement("afterend", dateLabel);
    if (expandedtoBox) expandedtoBox.removeAttribute("style");

    if (dateLabel) dateLabel.removeAttribute("style");
    if (dateLabel) dateLabel.removeEventListener("dblclick", stopDblclick, true);
    if (dateLabel) dateLabel.removeEventListener("contextmenu", stopContext, true);

    let dateLabelSubject = window.document.getElementById("dateLabelSubject");
    if (dateLabelSubject) dateLabelSubject.removeAttribute("style");

    let encryptionTechBtn = window.document.getElementById("encryptionTechBtn");
    if (encryptionTechBtn) encryptionTechBtn.removeAttribute("style");


    let singleMessage = window.document.getElementById("singleMessage");
    if (singleMessage) singleMessage.removeAttribute("style");
  }
  ExtensionSupport.unregisterWindowListener("compactHeadersListener");
  console.debug("Compact Headers disabled");
  }
};
