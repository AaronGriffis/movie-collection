var url = "../php/";
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
   url = "../movies/php/";
}

$(document).ready(loaded);

function loaded() {
   $.ajax(url + "crud.php", {
      type: "GET",
      data: { table: "movies" },
      success: loadMovies,
      dataType: "json",
      error: function(response) {displayError(response);},
      cache: false
   });
   $.ajax(url + "crud.php", {
      type: "GET",
      data: { table: "genres" },
      success: loadGenres,
      dataType: "json",
      error: function(response) {displayError(response);},
      cache: false
   });

   $("#btn-create").click(onClickAdd);
   $("#btn-submit").click(onClickSave);
   $("#btn-login").click(login);
   $("#login-modal input").keyup(function(event) {
      if (event.keyCode == 13) {
         $("#btn-login").click();
      }
   });
   
   $("#btn-modal-search").click(onClickModalSearch);
   $("#modal-search").keyup(function(event) {
      if (event.keyCode == 13) {
         $("#btn-modal-search").click();
      }
   });

   $("#modal input, #modal select").not("#modal-search").keyup(function(event) {
      if (event.keyCode == 13) {
         $("#btn-submit").click();
      }
   });

   $('#modal').on('shown.bs.modal', function () {
      $('#modal-search').focus();
   });
   $('#modal').on('hide.bs.modal', function () {
      $('#modal [name]').val('');
      $("#results").empty();
      $("#modal-search").val("");
      $("#checkbox-seen").prop("checked", false);
   });

   $("#results:empty").parent().hide();

   $("#table-search").keyup(onClickTableSearch);
   $("#clear-table-search").click(function() {
      $("#table-search").val('').focus();
      $(this).hide();
      onClickTableSearch();
   });

   $("#movie-table>thead th").not("#movie-table>thead th:last-of-type").click(onClickSort).mousedown(function(e){ e.preventDefault(); });
}

function login() {
   var data;
   if ($('#form-login input[name="user"]').val() !== "" && $('#form-login input[name="pass"]').val() !== "") {
      data = $("#form-login").serialize();
   }
   $.ajax(url + "login.php", {
      type: 'POST',
      data: data,
      success: function(e) {
         if (e === "not logged in")
            onLoginFail();
         else
            onLoginSuccess();
      },
      error: onLoginFail,
      cache: false
   });
}

function onLoginFail() {
   $("#login-modal").modal("show");
   $("#btn-submit").prop("disabled", true);
   $('.summary-row .btn-danger').prop("disabled", true);
   $('.summary-row .btn-danger>span').click(function(e) {e.stopPropagation()});
}

function onLoginSuccess() {
   $("#btn-submit").prop("disabled", false);
   $('.summary-row .btn-danger').prop("disabled", false);
}

//Adds json data to table using buildRow helper function
function loadMovies(data) {
   $.each(data, function(i, item) {
      buildRows(item);
   });
   $("#movie-table>thead th:nth-of-type(2)").trigger('click');
   $("#progress-bar").remove();
   $(".table-responsive").show();
   
   login();
}

function buildRows(item) {
   var $row = buildRow(item);
   var $detailRow = buildDetailRow(item);

   $row.appendTo("#movie-table");
   $detailRow.appendTo("#movie-table");
}

function buildRow(item) {
   var hours = Math.floor(item.runtime / 60) + "h ";
   var minutes =
      (item.runtime % 60 < 10 ? "0" + item.runtime % 60 : item.runtime % 60) +
      "m";
   var runtime = hours + minutes;

   //create edit button
   var $btnEdit = $(
      '<button type="button" class="btn btn-warning"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span><span class="sr-only">Edit</span></button>'
   );
   $btnEdit.attr("data-movie_id", item.movie_id);
   $btnEdit.click(onClickEdit);

   //create delete button
   var $btnDel = $(
      '<button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span><span class="sr-only">Delete</span></button>'
   );
   $btnDel.attr("data-movie_id", item.movie_id);
   $btnDel.click(onClickDelete);
   
   return $('<tr class="summary-row" data-movie_id=' + item.movie_id + ' data-target="#' + item.movie_id + '" data-toggle="collapse">').append(
      $('<td class="seen" data-seen="' + item.seen + '">' + getSeen(item.seen) + '</td>'),
      $('<td>' + item.title + '</td>'), ' ',
      $('<td>' + item.year + '</td>'), ' ',
      $('<td class="star-rating" data-rating="' + item.rating + '">').append(getStars(item.rating)),
      $('<td data-runtime="' + item.runtime + '">' + runtime + '</td>'), ' ',
      $('<td class="btns">').append(
         $('<div class="btn-group" role="group">').append(
            $btnEdit, $btnDel
         )
      )
   );
}

function buildDetailRow(item) {
   var $linkOverview = $('<a href="#overview-modal" data-toggle="modal" data-target="#overview-modal">Read Overview</a>');
   $linkOverview.attr("data-movie_id", item.movie_id);
   $linkOverview.click(onClickOverview);

   return $('<tr class="detail-row" data-movie_id=' + item.movie_id + '>').append(
      $('<td class="detail-data" colspan="100%">').append(
         $('<div class="collapse" id="' + item.movie_id + '">').append(
            $('<table class="table table-condensed table-bordered">').append(
               $('<tbody>').append(
                  $('<tr>').append(
                     $('<th>Starring</th>'), ' ',
                     $('<td>' + item.starring + '</td>'), ' '
                  ),
                  $('<tr>').append(
                     $('<th>Director</th>'), ' ',
                     $('<td>' + item.director + '</td>'), ' '
                  ),
                  $('<tr>').append(
                     $('<th>Genre(s)</th>'), ' ',
                     $('<td>' + item.genres + '</td>'), ' '
                  ),
                  $('<tr>').append(
                     $('<th>IMDb</th>'), ' ',
                     $('<td class="imdb"><a target="_blank" href="http://www.imdb.com/title/' + item.imdb + '">View on IMDb</a></td>'), ' '
                  ),
                  $('<tr>').append(
                     $('<th>Overview</th>'), ' ',
                     $('<td class="overview">').append(
                        $linkOverview,
                        $('<p hidden class="poster">' + item.poster + '</p>'), ' ',
                        $('<p hidden class="overview-text">' + item.overview + '</p>')
                     )
                  ),
                  $('<tr>').append(
                     $('<th>Quality</th>'), ' ',
                     $('<td>' + item.quality + '</td>'), ' '
                  )
               )
            )
         )
      )
   );
}

function loadGenres(data) {
   $.each(data, function(i, item) {
      buildOption(item);
   });
}

function buildOption(item) {
   $('#modal select[name="genres[]"]').append($("<option>").text(item.genre));
}

function onClickTableSearch(e) {
   if (typeof e !== "undefined" && e.keyCode == 27) {
      $("#clear-table-search").trigger('click');
      return false;
   }

   var $searchTerm = $("#table-search").val(),
   length = $.trim($searchTerm).length,
   $rows = $('#movie-table>tbody>tr');

   $("#clear-table-search").toggle(length != 0);
   if (length > 0) {
      var $search = '^(?=.*\\b' + $.trim($searchTerm).split(/\s+/).join('\\b)(?=.*\\b') + ').*$',
      reg = RegExp($search, 'i');

      $rows.show();
      $matched = $rows.filter(function() {
         var text = '';
         $(this).find('td:not(.seen):not(.star-rating):not(.btns):not(.detail-data):not(.overview):not(.imdb)').each(function(i, element) {
            text += $(element).text() + ' ';
         });
         text = text.replace(/\s+/g, ' ');
         return reg.test(text);
      });
      $matched.each(function(index, element) {
         $matched = $matched.add($('tr[data-movie_id=' + $(element).data("movie_id") + ']'));
      });
      $rows.not($matched).hide();
   }
   else {
      $rows.show();
   }
}

function onClickModalSearch() {
   if ($.trim($("#modal-search").val()).length != 0) {
      var url = "https://api.themoviedb.org/3/",
         mode = "search/movie?api_key=",
         key = "ed5e506102eb06dfa144cfe4eadea522",
         query = "&query=",
         input = encodeURI($("#modal-search").val());

      $("#results").empty();
      $("#modal-search").val("");

      $.get(url + mode + key + query + input, populateResults, "json");
   } else {
      $("#results").empty();
      $("#modal-search").val("");
      $("#results:empty").parent().hide();
   }
}

function populateResults(data) {
   if (data.results.length == 0) {
      $('<p class="list-group-item list-group-item-danger">')
         .text("No results found..")
         .appendTo("#results");
      $("#results").parent().show();
   }
   else {
      $.each(data.results, function(i, item) {
         buildListItem(item);
      });
      $("#results").parent().show();
      $('#results :first-child').focus();
   }
}

function buildListItem(item) {
   var text = item.title + (item.release_date === "" ? "" : " (" + item.release_date.slice(0, 4) + ")"),
      $link = $('<a href="#" class="list-group-item">').text(text);

   $link.attr("data-id", item.id);
   $link.click(onClickResult);
   $link.appendTo("#results");
}

function onClickResult(e) {
   var url = "https://api.themoviedb.org/3/",
      mode = "movie/",
      id = $(e.currentTarget).data("id"),
      key = "?api_key=ed5e506102eb06dfa144cfe4eadea522",
      credits = "&append_to_response=credits";

   $("#results").empty().parent().hide();
   $("#modal-search").val("");

   $.get(url + mode + id + key + credits, populateEditFromDatabase, "json");
}

function sortRows() {
   $('[data-sorted]').filter(function() {
      return $(this).data('sorted') == true;
   }).data('sorted', false).trigger('click');
}

function onClickSort(th) {
   var $this = $(this),
   $table = $("#movie-table"),
   $rows = $('.summary-row:not([style="display: none;"])'),
   $headers = $('#movie-table>thead th:not(:last-child)'),
   $thisIcon = $this.children(".glyphicon-triangle-top, .glyphicon-triangle-bottom"),
   $otherIcons = $headers.children(".glyphicon-triangle-top, .glyphicon-triangle-bottom").not($thisIcon),
   header = $this.text(),
   index = $headers.index($this);

   $thisIcon.show();
   $otherIcons.hide();

   if ($this.data('sorted')) {
      $this.data('asc', !$this.data('asc'));
      if (index == 0) {
         $this.children(".glyphicon-eye-open, .glyphicon-eye-close").toggleClass('glyphicon-eye-open glyphicon-eye-close');
      } else {
         $thisIcon.toggleClass('glyphicon-triangle-top glyphicon-triangle-bottom');
      }
   }
   else {
      $this.data('sorted', true);
      $headers.not($this).each(function() {
         $(this).data('sorted', false);
      });
   }
   var isAsc = $this.data('asc');

   $rows.sort(function(a, b) {
      var valA, valB,
      $colA = $(a).children().eq(index),
      $colB = $(b).children().eq(index);

      switch(header) {
         case "Seen":
            valA = Number($colA.data('seen'));
            valB = Number($colB.data('seen'));
            break;
         case "Title":
            //Ignore "The " when sorting by title
            if ($colA.text().startsWith("The ")) {
               valA = $colA.text().substr(4);
            } else {
               valA = $colA.text();
            }
            if ($colB.text().startsWith("The ")) {
               valB = $colB.text().substr(4);
            } else {
               valB = $colB.text();
            }
            break;
         case "Rating":
            valA = Number($colA.data('rating'));
            valB = Number($colB.data('rating'));
            break;
         case "Runtime":
            valA = Number($colA.data('runtime'));
            valB = Number($colB.data('runtime'));
            break;
         default:
            valA = $colA.text();
            valB = $colB.text();
      }

      var comp;
      if ($.isNumeric(valA) && $.isNumeric(valB)) {
         comp = valA - valB;
      }
      else {
         comp = valA.localeCompare(valB);
      }
      return isAsc ? (comp) : (comp * -1);
   }).each(function(i, row) {
      $table.append(row);
      var movie_id = $(row).data('movie_id');
      $table.append($('.detail-row[data-movie_id="' + movie_id + '"]'));
   });
}

function onClickAdd() {
   $("#btn-submit").attr("data-action", "create");
   $("#btn-submit").text("Add Movie");
   $("#modal .modal-title").text("Add a Movie");
}

function onClickOverview(e) {
   var movie_id = $(e.currentTarget).data("movie_id"),
   title = $('.summary-row[data-movie_id="' + movie_id + '"]>td:nth-of-type(2)').text(),
   overview = $('.detail-row[data-movie_id="' + movie_id + '"] .overview-text').text(),
   poster = $('.detail-row[data-movie_id="' + movie_id + '"] .poster').text(),
   html = '<h4>' + overview + '</h4>';

   if (poster !== "null") {
      html =  '<div class="row"> \
                  <div class="col-sm-4"> \
                     <img class="img-responsive img-thumbnail" src="https://image.tmdb.org/t/p/w185' + poster + '" alt="movie poster"> \
                  </div> \
                  <div class="col-sm-8"> \
                     <h4>' + overview + '</h4> \
                  </div> \
               </div>';
   }

   $('#overview-modal .modal-body').html(html);
   $('#overview-modal .modal-title').text(title);
}

function onClickEdit(e) {
   e.stopPropagation();
   $("#btn-submit").attr("data-action", "update");
   $("#btn-submit").text("Save Changes");
   $("#modal .modal-title").text("Edit Movie");
   $.get(
      url + "crud.php",
      {
         table: "movies",
         movie_id: $(this).data("movie_id")
      },
      function(data) {
         populateEdit(data[0]);
      },
      "json"
   );
}

function populateEdit(data) {
   $("#modal input[name=movie_id]").val(data.movie_id);
   $("#modal input[name=title]").val(data.title);
   $("#modal input[name=year]").val(data.year);
   $("#modal input[name=rating]").val(data.rating);
   $("#modal input[name=hours]").val(Math.floor(data.runtime / 60));
   $("#modal input[name=minutes]").val(data.runtime % 60);
   $("#modal input[name=starring]").val(data.starring);
   $("#modal input[name=director]").val(data.director);
   $('#modal select[name="genres[]"]').val(data.genres.split(", "));
   $("#modal input[name=imdb]").val(data.imdb);
   $("#modal textarea[name=overview]").val(data.overview);
   $("#modal input[name=poster]").val(data.poster);
   $("#modal select[name=quality]").val(data.quality);
   $("#modal input[name=seen]").prop("checked", !!+data.seen);
   $("#modal").modal("show");
}

function populateEditFromDatabase(data) {
   $("#modal input[name=title]").val(data.title);
   $("#modal input[name=year]").val(data.release_date.slice(0, 4));
   $("#modal input[name=rating]").val(data.vote_average);
   $("#modal input[name=hours]").val(Math.floor(data.runtime / 60));
   $("#modal input[name=minutes]").val(data.runtime % 60);
   $("#modal input[name=starring]").val(getStarring(data));
   $("#modal input[name=director]").val(getDirector(data));
   $('#modal select[name="genres[]"]').val(getGenreSelection(data.genres));
   $("#modal input[name=imdb]").val(data.imdb_id);
   $("#modal textarea[name=overview]").val(data.overview);
   $("#modal input[name=poster]").val(data.poster_path);
   $("#modal select[name=quality]").val("1080p");
   $("#modal input[name=seen]").prop("checked", false);

   $('#btn-submit').focus();
}

function getSeen(hasSeen) {
   return (hasSeen==1 ? '<span class="glyphicon glyphicon-eye-open"></span>' : '<span class="glyphicon glyphicon-eye-close"></span>' )
}

function getDirector(data) {
   var directors = [];
   data.credits.crew.forEach(function(entry) {
      if (entry.job === "Director") {
         directors.push(entry.name);
      }
   });
   return directors.join(", ");
}

function getStarring(data) {
   var count = 5,
       topCast = [];

   for (var i = 0, noMoreCast = false; noMoreCast == false && i < count; i++) {
      if (data.credits.cast[i] === undefined)
         noMoreCast = true;
      else
         topCast.push(data.credits.cast[i].name);
   }
   return topCast.join(", ");
}

function getStars(rating) {
   var bgStar = '<span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>',
   fgStar = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>',
   $bgStars = $('<div class="bg-stars">').append(bgStar, ' ', bgStar, ' ', bgStar, ' ', bgStar, ' ', bgStar),
   $fgStars = $('<div class="fg-stars" style="width: ' + (rating * 10) + '%">').append(fgStar, ' ', fgStar, ' ', fgStar, ' ', fgStar, ' ', fgStar),
   $html = $('<div>').append($fgStars, $bgStars);
   return $html;
}

function onClickDelete(e) {
   e.stopPropagation();
   var movie_id = $(this).data("movie_id");
   if (window.confirm("Are you sure you want to delete this movie?")) {
      var senddata = { movie_id: movie_id };
      $.delete(url + "crud.php", senddata, function(data) {
         $("tr[data-movie_id=" + movie_id + "]").remove();
      }).fail(function(response) {displayError(response);});
   }
}

function onClickSave() {
   var $data = {
      movie_id: $("#modal input[name=movie_id]").val(),
      title: $("#modal input[name=title]").val(),
      year: $("#modal input[name=year]").val(),
      rating: $("#modal input[name=rating]").val(),
      runtime:
         Number($("#modal input[name=hours]").val()) * 60 +
         Number($("#modal input[name=minutes]").val()),
      starring: $("#modal input[name=starring]").val(),
      director: $("#modal input[name=director]").val(),
      genres: $('#modal select[name="genres[]"]').val(),
      imdb: $("#modal input[name=imdb]").val(),
      overview: $("#modal textarea[name=overview]").val(),
      poster: $("#modal input[name=poster]").val(),
      quality: $("#modal select[name=quality]").val(),
      seen: $("#modal input[name=seen]").prop("checked")
   };
   if ($("#btn-submit").attr("data-action") === "create") {
      $.post(
         url + "crud.php",
         $data,
         function(data) {
            buildRows(data[0]);
            sortRows();
         },
         "json"
      ).fail(function(response) {displayError(response);});
   } else {
      $.put(
         url + "crud.php",
         $data,
         function(data) {
            onSuccessfulEdit(data[0]);
            sortRows();
         },
         "json"
      ).fail(function(response) {displayError(response);});
   }
}

function onSuccessfulEdit(data) {
   var $row = $('.summary-row[data-movie_id=' + data.movie_id + ']');
   var $detailRow = $('.detail-row[data-movie_id=' + data.movie_id + ']');
   $row.replaceWith(buildRow(data));
   $detailRow.replaceWith(buildDetailRow(data));
}

function getGenreSelection(genres) {
   var selection = [];
   genres.forEach(function(e) {
      selection.push(e.name);
   });
   return selection;
}

function displayError(response) {
   var message = "";
   if (response.status == 401) {
      message = "<strong>Unauthorized:</strong> You are not allowed to add, edit, or delete movies";
   } else if (response.status == 406) {
      message = "<strong>Error:</strong> " + response.responseText + " parameter missing";
   }
   $("#alert-placeholder").html(
      '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
         '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
         '<span aria-hidden="true">&times;</span>' +
         "</button>" +
         message +
      "</div>"
   );

   setTimeout(function(){
      $("#alert-placeholder>.alert").alert('close');
   }, 6000);
}

//Adds PUT and DELETE functions
jQuery.each(["put", "delete"], function(i, method) {
   jQuery[method] = function(url, data, callback, type) {
      if (jQuery.isFunction(data)) {
         type = type || callback;
         callback = data;
         data = undefined;
      }

      return jQuery.ajax({
         url: url,
         type: method,
         dataType: type,
         data: data,
         success: callback
      });
   };
});




//Temporary utility function for adding additional info fro the API to the database
function addInfoToAll() {
   var speed = 500,
   timer = setInterval(iter, speed),
   rows = $(".summary-row"),
   length = rows.length,
   index = 0,
   movie_url = "https://api.themoviedb.org/3/",
   mode = "search/movie?api_key=",
   key = "ed5e506102eb06dfa144cfe4eadea522",
   query = "&query=";

   function iter() {
      var $this = rows.eq(index),
      movie_id = $this.data("movie_id"),
      title = $this.children("td:nth-of-type(2)").text(),
      input = encodeURI(title);

      $.get(movie_url + mode + key + query + input, function(data) {
         $.get(movie_url + 'movie/' + data.results[0].id + '?api_key=' + key + '&append_to_response=credits', function(data) {
            // console.log(title, data.credits.cast);
            var starring = getStarring(data)
            if (starring === '')
               console.log(title + ': ***** ERROR: NO STARS ADDED *****');
            else
               console.log(title + ': ' + starring);

            $.put(
               url + "crud.php",
               {movie_id: movie_id,
               starring: getStarring(data)},
            );
         }, "json");
      }, "json");

      index++;
      if (index >= length) {
         clearInterval(timer);
      }
   }
}