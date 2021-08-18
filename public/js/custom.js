 // page scroll----------------------------------------





 (function( $ ) { "use strict";   

 $(function() {

     $('header a[href*="#"], .view-btns a[href*="#"]').click(function() {

           if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {

             var target = $(this.hash);

             target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

             if (target.length) {

               $('html, body').animate({

                 scrollTop: target.offset().top -80

               }, 1000);

               return false;

             }

           }

       });

 });   

}(jQuery));





jQuery(document).ready(function($) {

   jQuery('.sub-menu-parent > a').on('click', function () {
       jQuery('.sub-menu').addClass('open');
   });
   jQuery('.sub-menu-parent .back, .cd-nav-trigger').on('click', function () {
       jQuery('.sub-menu').removeClass('open');
   });

   $(".userform").validate({

     rules: {

       fullname: "required",

       email: {

         required: true,

         email: true

       },

       contactnumber :{

         required: true,

         number: true

       },

       people:{

         required: true,

         number: true

       },

     },

   });



   // Countdown ----------------------------------------

   $(function() {

       var austDay = new Date();

       austDay = new Date(austDay.getFullYear() + 1, 1 - 1, 26);

       $('#defaultCountdown').countdown({

           until: austDay

       });

       $('#year').text(austDay.getFullYear());

   });

   

   // Header sticky------------------------------------------

   $(window).scroll(function() {

       if ($(window).scrollTop()) {

           $('#top-header').addClass('sticky-header');

       } else {

           $('#top-header').removeClass('sticky-header');

       }

   });



   // Counts ------------------------------------------

   (function($) {

       "use strict";



       function count($this) {

           var current = parseInt($this.html(), 10);

           current = current + 1;

           $this.html(++current);

           if (current > $this.data('count')) {

               $this.html($this.data('count'));

           } else {

               setTimeout(function() {

                   count($this)

               }, 50);

           }

       }

       $(".stat-count").each(function() {

           $(this).data('count', parseInt($(this).html(), 10));

           $(this).html('0');

           count($(this));

       });

   })(jQuery);





   // What Client Says Slider------------------------------------------

   $('#what-client-says .owl-carousel').owlCarousel({

       loop: true,

       margin: 10,

       nav: true,



       responsive: {

           0: {

               items: 1

           },

           600: {

               items: 1

           },

           1000: {

               items: 1

           }

       }

   })





   // What Client Says Slider------------------------------------------

   $('#sponsers-logo-slider .owl-carousel').owlCarousel({

       loop: true,

       nav: false,

       responsive: {

           0: {

               items: 1

           },

           480: {

               items: 2

           },

           600: {

               items: 2

           },

           1000: {

               items: 3

           }

       }

   })



   // Upcoming Events & News Slider------------------------------------------

   $('#upcoming-events-slider .owl-carousel').owlCarousel({

           loop: false,

           nav: false,

           dots: false,

           margin: 30,

           responsive: {

               0: {

                   items: 1,

                   nav: true

               },

               767: {

                   items: 2,

                   nav: true

               },

               991: {

                   items: 2

               },

               1000: {

                   items: 3

               }

           }

       })



   // Add and remove class parent on focus

     $(".newslatter-form input.email").focus(function(){

       $(this).parent().addClass("active");



     }).blur(function(){

          $(this).parent().removeClass("active");

     })





      

});