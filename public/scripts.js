/*!
  * Start Bootstrap - Grayscale v6.0.2 (https://startbootstrap.com/themes/grayscale)
  * Copyright 2013-2020 Start Bootstrap
  * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
  */
  (function ($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length
        ? target
        : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top,
          },
          1000,
          "easeInOutExpo"
        );
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $(".js-scroll-trigger").click(function () {
    $(".navbar-collapse").collapse("hide");
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $("body").scrollspy({
    target: "#mainNav",
    offset: 100,
  });

  // Collapse Navbar
  var navbarCollapse = function () {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };

  $('form').submit(function(event){
    if($('#email').val()=='') return event.preventDefault();
    $.post('/subscribe',{email: $('#email').val()},function(data,status){
      $('#submit-btn').css('background-color','rgb(244, 67, 54)');
      $('#submit-btn').css('cursor','auto');
      $('#submit-btn').text('SUBSCRIBED');
      setTimeout(function(){
        $('#submit-btn').css('background-color','rgb(84, 139, 135)');
        $('#submit-btn').css('cursor','pointer');
        $('#submit-btn').text('SUBSCRIBE');
        $('#email').val('');
      },2000);
    });
    event.preventDefault();
  });
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);
})(jQuery); // End of use strict
