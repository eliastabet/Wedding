/* =========================================================
   Wedding site — JavaScript
   Two things to edit here: WEDDING (below) and SCRIPT_URL.
   ========================================================= */

var WEDDING = {
  title:       "Elias & Maria's Wedding",
  // 24-hour clock, YYYY-MM-DDTHH:MM:SS
  start:       "2026-12-26T17:30:00",
  end:         "2026-12-27T02:00:00",
  // Beirut is UTC+02:00 in December.
  utcOffset:   "+02:00",
  location:    "Saint Elias Maronite Church, Kantari, Beirut",
  description: "Ceremony at 5:30 PM, Saint Elias Maronite Church, Kantari. Reception to follow at 7:00 PM, Sursock Palace, Ashrafieh."
};

/* Paste your Google Apps Script web app URL here (see README, step 4). */
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxyzOcKxccjWObgqVepRbdASgy0hN1Cmj_DtlAjiYXMjs5Oug4taAeuYhVVtgjDt88goQ/exec";


/* ---------------------------------------------------------
   Mobile navigation
   --------------------------------------------------------- */
(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  });
})();


/* ---------------------------------------------------------
   Add to calendar
   --------------------------------------------------------- */
(function () {
  var buttons = document.querySelectorAll("[data-calendar]");
  if (!buttons.length) return;

  function toUTCStamp(localTime) {
    return new Date(localTime + WEDDING.utcOffset)
      .toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  var startUTC = toUTCStamp(WEDDING.start);
  var endUTC = toUTCStamp(WEDDING.end);

  function openGoogle() {
    var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(WEDDING.title) +
      "&dates=" + startUTC + "/" + endUTC +
      "&details=" + encodeURIComponent(WEDDING.description) +
      "&location=" + encodeURIComponent(WEDDING.location);
    window.open(url, "_blank", "noopener");
  }

  function downloadICS() {
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding//EN", "BEGIN:VEVENT",
      "UID:" + Date.now() + "@wedding",
      "DTSTAMP:" + startUTC, "DTSTART:" + startUTC, "DTEND:" + endUTC,
      "SUMMARY:" + WEDDING.title,
      "DESCRIPTION:" + WEDDING.description,
      "LOCATION:" + WEDDING.location,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");

    var blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "elias-and-maria.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.calendar === "google") openGoogle();
      else downloadICS();
    });
  });
})();


/* ---------------------------------------------------------
   Countdown
   --------------------------------------------------------- */
(function () {
  var el = document.getElementById("countdown");
  if (!el) return;

  var target = new Date(WEDDING.start + WEDDING.utcOffset).getTime();

  function unit(value, label) {
    return '<span class="count-unit"><span class="count-num">' + value +
           '</span><span class="count-label">' + label + '</span></span>';
  }

  function render() {
    var diff = target - Date.now();
    if (diff <= 0) {
      el.innerHTML = unit("Today", "the day is here");
      return;
    }
    var mins = Math.floor(diff / 60000);
    var days = Math.floor(mins / 1440);
    var hours = Math.floor((mins % 1440) / 60);
    el.innerHTML = unit(days, days === 1 ? "day" : "days") +
                   unit(hours, hours === 1 ? "hour" : "hours") +
                   unit(mins % 60, "minutes");
  }

  render();
  setInterval(render, 60000);
})();


/* ---------------------------------------------------------
   Copy to clipboard (registry)
   --------------------------------------------------------- */
(function () {
  var buttons = document.querySelectorAll(".copy-btn");
  if (!buttons.length) return;

  var toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  var toastTimer;

  function announce(text) {
    toast.textContent = text;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-shown"); }, 1800);
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy || "";

      function done(ok) {
        if (!ok) { announce("Copy failed — select it by hand"); return; }
        btn.classList.add("is-copied");
        announce("Copied");
        setTimeout(function () { btn.classList.remove("is-copied"); }, 1600);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(function () { done(true); })
          .catch(function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });
})();


/* ---------------------------------------------------------
   RSVP form
   --------------------------------------------------------- */
(function () {
  var form = document.getElementById("rsvp-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var attending = form.querySelectorAll('input[name="attending"]');
  var guests = form.querySelectorAll('input[name="guests"]');
  var guestsGroup = document.getElementById("guests-group");
  var namesGroup = document.getElementById("guest-names-group");
  var comingOnly = [guestsGroup, document.getElementById("dietary-group"),
                    document.getElementById("song-group")];

  function selected(list) {
    for (var i = 0; i < list.length; i++) { if (list[i].checked) return list[i].value; }
    return "";
  }

  // Fields that only make sense for people who are coming
  function syncAttending() {
    var coming = selected(attending) === "Yes";
    comingOnly.forEach(function (g) { if (g) g.hidden = !coming; });
    syncGuests(coming);
  }

  // The party-names field appears once more than one person is coming
  function syncGuests(coming) {
    if (!namesGroup) return;
    namesGroup.hidden = !(coming && Number(selected(guests)) > 1);
  }

  attending.forEach(function (r) { r.addEventListener("change", syncAttending); });
  guests.forEach(function (r) {
    r.addEventListener("change", function () { syncGuests(selected(attending) === "Yes"); });
  });
  syncAttending();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "A couple of fields still need filling in.";
      status.className = "form-status error";
      return;
    }

    if (SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
      status.textContent = "The form is not connected yet. Add your Apps Script URL in js/main.js.";
      status.className = "form-status error";
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending…";
    status.textContent = "";
    status.className = "form-status";

    var data = new FormData(form);
    data.append("submittedAt", new Date().toISOString());

    fetch(SCRIPT_URL, { method: "POST", body: data, mode: "no-cors" })
      .then(function () {
        var coming = selected(attending) === "Yes";
        form.innerHTML =
          '<div class="form-done center">' +
          '<h3>' + (coming ? "Thank you, see you there" : "Thank you for letting us know") + '</h3>' +
          '<div class="ornament ornament-sm"></div>' +
          '<p>' + (coming
            ? "Your reply is in. We will be in touch closer to the day."
            : "We will miss you, and we are glad you told us.") + '</p>' +
          '</div>';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "Send RSVP";
        status.textContent = "That did not go through. Please try again in a moment.";
        status.className = "form-status error";
      });
  });
})();


/* ---------------------------------------------------------
   Photo placeholders
   Hides the "Add images/x.jpg" label once the real photo loads.
   --------------------------------------------------------- */
(function () {
  document.querySelectorAll(".photo").forEach(function (tile) {
    var bg = tile.style.backgroundImage;
    var match = bg && bg.match(/url\(["']?(.+?)["']?\)/);
    if (!match) return;
    var probe = new Image();
    probe.onload = function () { tile.textContent = ""; };
    probe.src = match[1];
  });
})();
