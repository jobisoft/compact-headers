var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

let doToggle = undefined; //declare it here to make removeEventlistener work

function stopDblclick(e) {
  e.stopPropagation();
}

function stopContext(e) {
  e.preventDefault();
}

function getMessageWindow(nativeTab) {
  if (nativeTab instanceof Ci.nsIDOMWindow) {
    return nativeTab.messageBrowser.contentWindow
  } else if (nativeTab.mode && nativeTab.mode.name == "mail3PaneTab") {
    return nativeTab.chromeBrowser.contentWindow.messageBrowser.contentWindow
  } else if (nativeTab.mode && nativeTab.mode.name == "mailMessageTab") {
    return nativeTab.chromeBrowser.contentWindow;
  }
  return null;
}

function install(window) {
  let { document } = window;

  let msgHeaderView = document.getElementById("msgHeaderView");
  let messageHeader = document.getElementById("messageHeader");
  let messagepanebox = document.getElementById("messagepanebox");

  let headerViewToolbox = document.getElementById("header-view-toolbox");
  let headerViewToolbar = document.getElementById("header-view-toolbar");
  let otherActionsBox = document.getElementById("otherActionsBox");
  //let mailContext = document.getElementById("mailContext");
  //let menu_HeadersPopup = document.getElementById("menu_HeadersPopup");
  //let headerViewAllHeaders = document.getElementById("headerViewAllHeaders");

  let compactHeadersPopup = document.createXULElement("menupopup");
  compactHeadersPopup.id = "compactHeadersPopup";
  msgHeaderView.setAttribute("context", "compactHeadersPopup");

  let compactHeadersSingleLine = document.createXULElement("menuitem");
  compactHeadersSingleLine.id = "compactHeadersSingleLine";
  compactHeadersSingleLine.setAttribute("type", "checkbox");
  compactHeadersSingleLine.setAttribute("label", "Single Line Headers");
  compactHeadersSingleLine.setAttribute("tooltiptext", "Displays compact headers on a single line");
  compactHeadersSingleLine.addEventListener("command", () => setLines());

  let compactHeadersHideToolbar = document.createXULElement("menuitem");
  compactHeadersHideToolbar.id = "compactHeadersHideToolbar";
  compactHeadersHideToolbar.setAttribute("type", "checkbox");
  compactHeadersHideToolbar.setAttribute("label", "Hide Header Toolbar");
  compactHeadersHideToolbar.setAttribute("tooltiptext", "Hides the header toolbar");
  compactHeadersHideToolbar.addEventListener("command", () => toggleToolbar());

  let compactHeadersMoveToHeader = document.createXULElement("menuitem");
  compactHeadersMoveToHeader.id = "compactHeadersMoveToHeader";
  compactHeadersMoveToHeader.setAttribute("type", "checkbox");
  compactHeadersMoveToHeader.setAttribute("label", "Show To Header");
  compactHeadersMoveToHeader.setAttribute("tooltiptext", "Shows the To header on the first line in double line mode");
  compactHeadersMoveToHeader.addEventListener("command", () => toggleToHeader());

  let compactHeadersMoveCcHeader = document.createXULElement("menuitem");
  compactHeadersMoveCcHeader.id = "compactHeadersMoveCcHeader";
  compactHeadersMoveCcHeader.setAttribute("type", "checkbox");
  compactHeadersMoveCcHeader.setAttribute("label", "Show Cc Header");
  compactHeadersMoveCcHeader.setAttribute("tooltiptext", "Shows the Cc header on the first line in double line mode");
  compactHeadersMoveCcHeader.addEventListener("command", () => toggleCcHeader());

  let compactHeadersMoveContentBaseheader = document.createXULElement("menuitem");
  compactHeadersMoveContentBaseheader.id = "compactHeadersMoveContentBaseheader";
  compactHeadersMoveContentBaseheader.setAttribute("type", "checkbox");
  compactHeadersMoveContentBaseheader.setAttribute("label", "Show Website (RSS)");
  compactHeadersMoveContentBaseheader.setAttribute("tooltiptext", "Shows the Website from RSS messages on the first line in double line mode");
  compactHeadersMoveContentBaseheader.addEventListener("command", () => toggleContentBaseHeader());

  let compactHeadersmovetags = document.createXULElement("menuitem");
  compactHeadersmovetags.id = "compactHeadersmovetags";
  compactHeadersmovetags.setAttribute("type", "checkbox");
  compactHeadersmovetags.setAttribute("label", "Show Message Tags");
  compactHeadersmovetags.setAttribute("tooltiptext", "Show message Tags on the second line in double line mode");
  compactHeadersmovetags.addEventListener("command", () => toggleTags());

  //let compactHeadersViewAll = document.createXULElement("menuitem");
  //compactHeadersViewAll.id = "compactHeadersViewAll";
  //compactHeadersViewAll.setAttribute("type", "checkbox");
  //compactHeadersViewAll.setAttribute("label", "View All Headers");
  //compactHeadersViewAll.setAttribute("tooltiptext", "Show All or Normal headers from a message in expanded mode");
  //compactHeadersViewAll.addEventListener("command", () => markHeaders());

  try {
    let compactHeadersBox = document.getElementById("compactHeadersBox");
    if (compactHeadersBox) compactHeadersBox.remove();
  } catch (e) { }
  let compactHeadersBox = document.createXULElement("vbox");
  compactHeadersBox.id = "compactHeadersBox";
  compactHeadersBox.setAttribute("style", "margin-inline-start: -8px; position: relative; z-index: 1;");
  let compactHeadersButton = document.createXULElement("button");
  compactHeadersButton.id = "compactHeadersButton";
  compactHeadersButton.addEventListener("command", () => toggleHeaders());
  compactHeadersBox.append(compactHeadersButton);

  let compactHeadersLocale = window.navigator.language;
  if (compactHeadersLocale != "de") compactHeadersButton.setAttribute("accesskey", "D");
  compactHeadersButton.setAttribute("style", "background: transparent; margin: 0px -2px 0px 2px;\
    -moz-user-focus: ignore; border: 4px solid transparent; min-height: 0px; min-width: 0px;\
    padding: 0px !important; box-shadow: none; -moz-appearance: none;  fill: currentColor;");

  let compactHeadersSeparator = document.createXULElement("menuseparator");
  compactHeadersSeparator.id = "compactHeadersSeparator";

  //let compactHeadersHideHeaders = document.createXULElement("menuitem");
  //compactHeadersHideHeaders.id = "compactHeadersHideHeaders";
  //compactHeadersHideHeaders.addEventListener("command", () => hideHeaders());

  //let compactHeadersSeparator2 = document.createXULElement("menuseparator");
  //compactHeadersSeparator2.id = "compactHeadersSeparator2";

  let compactHeadersSeparator3 = document.createXULElement("menuseparator");
  compactHeadersSeparator3.id = "compactHeadersSeparator3";

  let compactHeadersSeparator4 = document.createXULElement("menuseparator");
  compactHeadersSeparator4.id = "compactHeadersSeparator4";

  //let compactHeadersHideHeaders2 = document.createXULElement("menuitem");
  //compactHeadersHideHeaders2.id = "compactHeadersHideHeaders2";
  //compactHeadersHideHeaders2.addEventListener("command", () => hideHeaders());

  let expandedfromRow = document.getElementById("expandedfromRow");
  expandedfromRow.setAttribute("style", "align-items: center; margin-block: inherit; margin-inline: -2px auto; overflow: hidden; min-width: fit-content;");
  expandedfromRow.insertAdjacentElement("afterbegin", compactHeadersBox);
  let expandedfromBox = document.getElementById("expandedfromBox");
  expandedfromBox.setAttribute("style", "margin-block: 1px; overflow: hidden; min-width: 250%; margin-inline-end: 1.6em;");
  expandedfromBox.firstChild.nextSibling.style.flexWrap = "nowrap";
  expandedfromBox.firstChild.nextSibling.style.minWidth = "inherit";
  let expandedfromLabel = document.getElementById("expandedfromLabel");
  if (expandedfromLabel) expandedfromLabel.style.width = "4em";
  if (expandedfromLabel) expandedfromLabel.style.marginInline = "-2px";

  let expandedtoRow = document.getElementById("expandedtoRow");
  let expandedtoBox = document.getElementById("expandedtoBox");
  expandedtoBox.firstChild.nextSibling.style.minWidth = "inherit";
  let expandedtoLabel = document.getElementById("expandedtoLabel");

  let expandedccRow = document.getElementById("expandedccRow");
  let expandedccBox = document.getElementById("expandedccBox");
  expandedccBox.firstChild.nextSibling.style.minWidth = "inherit";
  let expandedccLabel = document.getElementById("expandedccLabel");

  let expandedcontentBaseRow = document.getElementById("expandedcontent-baseRow");
  let expandedcontentBaseBox = document.getElementById("expandedcontent-baseBox");
  if (expandedcontentBaseBox) expandedcontentBaseBox.addEventListener("contextmenu", stopContext, true);
  if (expandedcontentBaseBox) expandedcontentBaseBox.firstChild.nextSibling.style.minWidth = "inherit";
  let expandedcontentBaseLabel = document.getElementById("expandedcontent-baseLabel");

  let expandedsubjectRow = document.getElementById("expandedsubjectRow");
  if (expandedsubjectRow) expandedsubjectRow.setAttribute("style", "overflow: hidden; margin-block: -1px 0;");

  let expandedsubjectBox = document.getElementById("expandedsubjectBox");
  if (expandedsubjectBox) expandedsubjectBox.addEventListener("dblclick", stopDblclick, true);
  if (expandedsubjectBox) expandedsubjectBox.addEventListener("contextmenu", stopContext, true);

  let expandedsubjectLabel = document.getElementById("expandedsubjectLabel");
  if (expandedsubjectLabel) expandedsubjectLabel.addEventListener("mouseover", () => setTooltip());
  if (expandedsubjectLabel) expandedsubjectLabel.style.marginBlock = "auto";

  let dateLabel = document.getElementById("dateLabel");
  if (dateLabel) dateLabel.setAttribute("style", "margin: auto 6px auto auto; min-width: fit-content; padding-inline-start: 1em;");
  if (dateLabel) dateLabel.addEventListener("dblclick", stopDblclick, true);
  if (dateLabel) dateLabel.addEventListener("contextmenu", stopContext, true);
  let dateLabelSubject = document.getElementById("dateLabelSubject");

  let expandedtagsBox = document.getElementById("expandedtagsBox");
  let expandedtagsRow = document.getElementById("expandedtagsRow");

  let encryptionTechBtn = document.getElementById("encryptionTechBtn");
  if (encryptionTechBtn) encryptionTechBtn.setAttribute("style", "margin-block: -4px;");

  let newsgroupsHeading = document.getElementById("newsgroupsHeading");
  if (newsgroupsHeading) newsgroupsHeading.setAttribute("style", "margin-block: auto;");

  let headerSenderToolbarContainer = document.getElementById("headerSenderToolbarContainer");
  if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.display = "flex";
  if (headerSenderToolbarContainer) headerSenderToolbarContainer.style.minHeight = "var(--recipient-avatar-size)";
  let headerSubjectSecurityContainer = document.getElementById("headerSubjectSecurityContainer");

  let headerHideLabels = document.getElementById("headerHideLabels");
  if (headerHideLabels) headerHideLabels.addEventListener("command", () => checkHiddenLabels());

  let expandedmessageIdBox = document.getElementById("expandedmessage-idBox");
  if (expandedmessageIdBox) expandedmessageIdBox.addEventListener("contextmenu", stopContext, true);

  let expandedinReplyToBox = document.getElementById("expandedin-reply-toBox");
  if (expandedinReplyToBox) expandedinReplyToBox.addEventListener("contextmenu", stopContext, true);

  let expandedreferencesBox = document.getElementById("expandedreferencesBox");
  if (expandedreferencesBox) expandedreferencesBox.addEventListener("contextmenu", stopContext, true);

  let expandednewsgroupsBox = document.getElementById("expandednewsgroupsBox");
  if (expandednewsgroupsBox) expandednewsgroupsBox.addEventListener("contextmenu", stopContext, true);

  let singleMessage = document.getElementById("singleMessage");
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
  //compactHeadersPopup.append(compactHeadersSeparator);
  //compactHeadersPopup.append(compactHeadersViewAll);
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
      expandedfromRow.style.flex = "auto";
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
    expandedfromRow.style.flex = "inherit";
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
      compactHeadersSingleLine.setAttribute("checked", true);
      singleLine();
    } else {
      compactHeadersSingleLine.setAttribute("checked", false);
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
      compactHeadersHideToolbar.setAttribute("checked", true);
    } else {
      compactHeadersHideToolbar.setAttribute("checked", false);
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

    //if (headerViewAllHeaders.getAttribute("checked") == "true") window.top.MsgViewAllHeaders();
    //else window.top.MsgViewNormalHeaders();

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
    //console.debug("headers checked");
  }

  function setCompactHeaders() {
    headerSenderToolbarContainer.style.flexWrap = "unset";
    if (messageHeader.getAttribute("singleline") == "singleline") messageHeader.style.paddingBottom = "3px";
    else messageHeader.style.paddingBottom = "6px";
    compactHeadersButton.setAttribute("class", "button button-flat");
    //console.debug("arrow-right");
    compactHeadersButton.image = "chrome://messenger/skin/overrides/arrow-right-12.svg";
    compactHeadersBox.setAttribute("style", "margin-inline-start: -8px; position: relative; z-index: 1;");
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

    headerViewToolbox.style.flex = "auto";
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
    compactHeadersBox.setAttribute("style", "margin-inline-start: -8px; position: relative; z-index: 1;");
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

  //function markHeaders() {
    //if (compactHeadersViewAll.getAttribute("checked") == "true") {
      //headerViewAllHeaders.setAttribute("checked", true)
    //} else {
      //headerViewAllHeaders.setAttribute("checked", false);
    //}
    //checkHeaders();
  //}

  function setDateLabelSubject() {
    expandedsubjectBox.insertAdjacentElement("afterend", dateLabel);
    dateLabelSubject.setAttribute("style", "display: none;");
  }

  function toggleHeaders() {
    switch (messageHeader.getAttribute("compact")) {
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
      compactHeadersMoveToHeader.setAttribute("checked", true);
    } else {
      compactHeadersMoveToHeader.setAttribute("checked", false);
    }
    if (messageHeader.getAttribute("moveccheader") == "moveccheader") {
      compactHeadersMoveCcHeader.setAttribute("checked", true);
    } else {
      compactHeadersMoveCcHeader.setAttribute("checked", false);
    }
    if (messageHeader.getAttribute("movecontentbaseheader") == "movecontentbaseheader") {
      compactHeadersMoveContentBaseheader.setAttribute("checked", true);
    } else {
      compactHeadersMoveContentBaseheader.setAttribute("checked", false);
    }
    if (messageHeader.getAttribute("movetags") == "movetags") {
      compactHeadersmovetags.setAttribute("checked", true);
    } else {
      compactHeadersmovetags.setAttribute("checked", false);
    }
  }

  function setTooltip() {
    if (expandedsubjectLabel) expandedsubjectLabel.setAttribute("tooltiptext", expandedsubjectBox.lastChild.textContent);
  }

  function checkHiddenLabels() {
    if ((expandedfromLabel.style.minWidth == "0px") || (expandedfromLabel.style.minWidth == "")) {
      expandedfromRow.style.marginLeft = "-2px";
      if ((messageHeader.getAttribute("compact") == "compact") && (messageHeader.getAttribute("singleline") == "singleline")) {
        expandedsubjectRow.style.paddingLeft = "1.2em";
      } else {
        expandedsubjectRow.style.paddingLeft = "0px";
      }
    } else {
      expandedfromRow.style.marginLeft = "4px";
      expandedsubjectRow.style.paddingLeft = "0px";
    }
  }

  function moveExpandedtagsBox() {
    if ((messageHeader.getAttribute("compact") == "compact") &&
      (messageHeader.getAttribute("singleline") != "singleline") &&
      (messageHeader.getAttribute("movetags") == "movetags")) {
      dateLabel.insertAdjacentElement("beforebegin", expandedtagsBox);
      dateLabel.style.marginLeft = "0px";
      expandedtagsBox.style.marginLeft = "auto";
      expandedtagsBox.style.maxHeight = "1.6em";
      expandedsubjectBox.style.flexBasis = "33%";
    } else if ((messageHeader.getAttribute("compact") != "compact") ||
      (messageHeader.getAttribute("singleline") == "singleline") ||
      (messageHeader.getAttribute("movetags") != "movetags")) {
      expandedtagsRow.insertAdjacentElement("beforeend", expandedtagsBox);
      dateLabel.style.marginLeft = "auto";
      expandedtagsBox.style.marginLeft = "0px";
      expandedtagsBox.style.maxHeight = "none";
      expandedsubjectBox.style.flexBasis = "unset";
    }
  }

  function checkOthers() {
    //if (headerViewAllHeaders.getAttribute("checked") == "true") {
      //compactHeadersViewAll.setAttribute("checked", true);
    //} else {
      //compactHeadersViewAll.setAttribute("checked", false);
    //}
    if (messageHeader.getAttribute("compact") == "compact") {
      expandedtoLabel.style.minWidth = "fit-content";
      expandedccLabel.style.minWidth = "fit-content";
      expandedcontentBaseLabel.style.minWidth = "fit-content";
    }
    if (messageHeader.getAttribute("compact") == "compact") {
      try {
        expandedccBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", expandHeaders, { once: true });
      } catch (e) { };
    }
    if (messageHeader.getAttribute("compact") == "compact") {
      try {
        expandedtoBox.firstChild.nextSibling.lastChild.firstChild.addEventListener("mousedown", expandHeaders, { once: true });
      } catch (e) { };
    }
  }

  function expandHeaders() {
    messageHeader.removeAttribute("compact");
    checkHeaders();
  }

  checkLines();
  markToolbar();
  checkToCcHeaders();
  checkOthers();
  checkHeaders();
  //console.debug("all checked");
}

function uninstall(window) {
  let { document } = window;

  let msgHeaderView = document.getElementById("msgHeaderView");
  if (msgHeaderView) msgHeaderView.removeAttribute("style");

  let messageHeader = document.getElementById("messageHeader");
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

  let headerViewToolbar = document.getElementById("header-view-toolbar");
  if (headerViewToolbar) headerViewToolbar.removeAttribute("style");
  if (headerViewToolbar) headerViewToolbar.removeEventListener("dblclick", stopDblclick, true);

  let expandedfromRow = document.getElementById("expandedfromRow");
  if (expandedfromRow) expandedfromRow.style.marginLeft = "0px";
  if (expandedfromRow) expandedfromRow.style.flex = "inherit";
  if (expandedfromRow) expandedfromRow.removeAttribute("style");

  let expandedfromLabel = document.getElementById("expandedfromLabel");
  if (expandedfromLabel) expandedfromLabel.removeAttribute("style");

  let expandedfromBox = document.getElementById("expandedfromBox");
  if (expandedfromBox) expandedfromBox.removeAttribute("style");

  let headerViewToolbox = document.getElementById("header-view-toolbox");
  if (headerViewToolbox) headerViewToolbox.removeAttribute("style");

  let expandedsubjectRow = document.getElementById("expandedsubjectRow");
  if (expandedsubjectRow) expandedsubjectRow.style.paddingLeft = "0px";
  if (expandedsubjectRow) expandedsubjectRow.removeAttribute("style");

  let expandedsubjectBox = document.getElementById("expandedsubjectBox");
  if (expandedsubjectBox) expandedsubjectBox.removeAttribute("style");
  if (expandedsubjectBox) expandedsubjectBox.removeEventListener("dblclick", stopDblclick, true);
  if (expandedsubjectBox) expandedsubjectBox.removeEventListener("contextmenu", stopContext, true);

  let expandedcontentBaseBox = document.getElementById("expandedcontent-baseBox");
  if (expandedcontentBaseBox) expandedcontentBaseBox.removeEventListener("contextmenu", stopContext, true);

  let expandedmessageIdBox = document.getElementById("expandedmessage-idBox");
  if (expandedmessageIdBox) expandedmessageIdBox.removeEventListener("contextmenu", stopContext, true);

  let expandednewsgroupsBox = document.getElementById("expandednewsgroupsBox");
  if (expandednewsgroupsBox) expandednewsgroupsBox.removeEventListener("contextmenu", stopContext, true);

  let expandedinReplyToBox = document.getElementById("expandedin-reply-toBox");
  if (expandedinReplyToBox) expandedinReplyToBox.removeEventListener("contextmenu", stopContext, true);

  let expandedreferencesBox = document.getElementById("expandedreferencesBox");
  if (expandedreferencesBox) expandedreferencesBox.removeEventListener("contextmenu", stopContext, true);

  //let compactHeadersHideHeaders = document.getElementById("compactHeadersHideHeaders");
  //if (compactHeadersHideHeaders) compactHeadersHideHeaders.remove();

  //let compactHeadersSeparator2 = document.getElementById("compactHeadersSeparator2");
  //if (compactHeadersSeparator2) compactHeadersSeparator2.remove();

  //let compactHeadersHideHeaders2 = document.getElementById("compactHeadersHideHeaders2");
  //if (compactHeadersHideHeaders2) compactHeadersHideHeaders2.remove();

  //let compactHeadersViewAll = document.getElementById("compactHeadersViewAll");
  //if (compactHeadersViewAll) compactHeadersViewAll.remove();
  let compactHeadersPopup = document.getElementById("compactHeadersPopup");
  if (compactHeadersPopup) compactHeadersPopup.remove();
  let compactHeadersButton = document.getElementById("compactHeadersButton");
  if (compactHeadersButton) compactHeadersButton.remove();
  let compactHeadersBox = document.getElementById("compactHeadersBox");
  if (compactHeadersBox) compactHeadersBox.remove();

  let expandedtoRow = document.getElementById("expandedtoRow");
  if (expandedtoRow) expandedtoRow.removeAttribute("style");
  let expandedccRow = document.getElementById("expandedccRow");
  if (expandedccRow) expandedccRow.removeAttribute("style");
  let expandedcontentBaseRow = document.getElementById("expandedcontent-baseRow");
  if (expandedcontentBaseRow) expandedcontentBaseRow.removeAttribute("style");
  let expandednewsgroupsRow = document.getElementById("expandednewsgroupsRow");

  let headerSubjectSecurityContainer = document.getElementById("headerSubjectSecurityContainer");
  let headerSenderToolbarContainer = document.getElementById("headerSenderToolbarContainer");
  if (headerSenderToolbarContainer) headerSenderToolbarContainer.insertAdjacentElement("afterend", headerSubjectSecurityContainer);
  if (expandedtoRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedtoRow);
  if (expandedccRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedccRow);
  if (expandednewsgroupsRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandednewsgroupsRow);
  if (expandedcontentBaseRow) headerSubjectSecurityContainer.insertAdjacentElement("beforebegin", expandedcontentBaseRow);
  if (headerSubjectSecurityContainer) headerSubjectSecurityContainer.removeAttribute("style");
  if (headerSenderToolbarContainer) headerSenderToolbarContainer.removeAttribute("style");

  let expandedccBox = document.getElementById("expandedccBox");
  if (expandedccBox) expandedccBox.removeAttribute("style");

  let expandedtoLabel = document.getElementById("expandedtoLabel");
  if (expandedtoLabel) expandedtoLabel.removeAttribute("style");
  let expandedccLabel = document.getElementById("expandedccLabel");
  if (expandedccLabel) expandedccLabel.removeAttribute("style");
  let expandedcontentBaseLabel = document.getElementById("expandedcontent-baseLabel");
  if (expandedcontentBaseLabel) expandedcontentBaseLabel.removeAttribute("style");

  let dateLabel = document.getElementById("dateLabel");
  let expandedtoBox = document.getElementById("expandedtoBox");
  if (expandedtoBox) expandedtoBox.insertAdjacentElement("afterend", dateLabel);
  if (expandedtoBox) expandedtoBox.removeAttribute("style");

  if (dateLabel) dateLabel.removeAttribute("style");
  if (dateLabel) dateLabel.removeEventListener("dblclick", stopDblclick, true);
  if (dateLabel) dateLabel.removeEventListener("contextmenu", stopContext, true);

  let dateLabelSubject = document.getElementById("dateLabelSubject");
  if (dateLabelSubject) dateLabelSubject.removeAttribute("style");

  let encryptionTechBtn = document.getElementById("encryptionTechBtn");
  if (encryptionTechBtn) encryptionTechBtn.removeAttribute("style");

  let singleMessage = document.getElementById("singleMessage");
  if (singleMessage) singleMessage.removeAttribute("style");

  let expandedtagsBox = document.getElementById("expandedtagsBox");
  let expandedtagsRow = document.getElementById("expandedtagsRow");
  if (expandedtagsRow) expandedtagsRow.insertAdjacentElement("afterbegin", expandedtagsBox);
  if (expandedtagsBox) expandedtagsBox.style.marginLeft = "0px";
}

var compactHeadersApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      compactHeadersApi: {
        async compactHeaders(tabId) {
          let { nativeTab } = context.extension.tabManager.get(tabId);
          let messageBrowserWindow = getMessageWindow(nativeTab);
          if (messageBrowserWindow) {
            // Load into the freshly opened messageBrowser window.
            install(messageBrowserWindow);
          }
        },
      },
    };
  }

  onShutdown(isAppShutdown) {
    if (isAppShutdown) return;

    // Uninstall from any messageBrowser in any tab in any mail:3pane window.
    for (let window of Services.wm.getEnumerator("mail:3pane")) {
      for (let nativeTab of window.gTabmail.tabInfo) {
        let messageBrowserWindow = getMessageWindow(nativeTab);
        if (messageBrowserWindow) {
          uninstall(messageBrowserWindow);
        }
      }
    }

    // Uninstall from messageBrowser window in all mail:messageWindow windows.
    for (let window of Services.wm.getEnumerator("mail:messageWindow")) {
      let messageBrowserWindow = getMessageWindow(window);
      if (messageBrowserWindow) {
        uninstall(messageBrowserWindow);
      }
    }

    console.debug("Compact Headers disabled");
  }
};
