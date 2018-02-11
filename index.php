<?php 
   session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">

   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   <meta name="apple-mobile-web-app-title" content="Aaron's Movies">

   <meta name="theme-color" content="black">
   
   <title>Aaron's Movies</title>

   <link rel="apple-touch-icon" sizes="180x180" href="img/favicon/apple-touch-icon.png?ver=1.1">
   <link rel="icon" type="image/png" sizes="32x32" href="img/favicon/favicon-32x32.png">
   <link rel="icon" type="image/png" sizes="16x16" href="img/favicon/favicon-16x16.png">
   <link rel="manifest" href="img/favicon/manifest.json">
   <link rel="mask-icon" href="img/favicon/safari-pinned-tab.svg" color="#253c54">
   <meta name="theme-color" content="#253c54">

   <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/darkly/bootstrap.min.css" integrity="sha384-S7YMK1xjUjSpEnF4P8hPUcgjXYLZKK3fQW1j5ObLSl787II9p8RO9XUGehRmKsxd" crossorigin="anonymous">
   <link rel="stylesheet" href="css/styles.css">
</head>

<body>
   <div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog modal-sm">
         <div class="modal-content">
            <div class="modal-header">
               <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
               <h2 class="modal-title">Welcome!</h2>
            </div>

            <div class="modal-body">
               <h4>This is a database representation of my movie collection.</h4>
               <p>As a guest, you won't be able to add, remove, or change anything.</p>
               <hr>
               <form id="form-login">
                  <div class="form-group">
                     <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-user"></span></span>
                        <input type="text" class="form-control" placeholder="Username" name="user">
                     </div>
                  </div>
                  <div class="form-group">
                     <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-lock"></span></span>
                        <input type="password" class="form-control" placeholder="Password" name="pass">
                     </div>
                  </div>
               </form>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-primary" data-dismiss="modal" id="btn-login">Login</button>
               <button type="button" class="btn btn-default" data-dismiss="modal">Continue as Guest</button>
            </div>
         </div>
      </div>
   </div>
   
   <div class="modal fade" id="overview-modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content" data-dismiss="modal">
            <div class="modal-header">
               <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
               <h4 class="modal-title">Overview</h4>
            </div>

            <div class="modal-body"></div>
         </div>
      </div>
   </div>

   <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content">
            <div class="modal-header">
               <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
               <h4 class="modal-title">Add a Movie</h4>
            </div>

            <div class="modal-body form-horizontal row">
               <div class="col-md-6">
                  <div class="alert alert-info alert-dismissible hidden-md hidden-lg" role="alert">
                     <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                     Use search box to auto-fill movie info
                  </div>
                  <h1 class="hidden-xs hidden-sm"><strong>Use search box above to auto-fill movie info</strong></h1>
                  <div class="form-group" id="searchbar">
                     <div class="col-sm-12">
                        <div class="input-group">
                           <input type="text" class="form-control" id="modal-search" placeholder="E.g. Fight Club" name="search">
                           <span class="input-group-btn">
                              <button class="btn btn-default" id="btn-modal-search" type="button">Search</button>
                           </span>
                        </div>
                     </div>
                  </div>
                  <div class="panel panel-default">
                     <div class="list-group" id="results"></div>
                  </div>
                  <hr class="separator hidden-md hidden-lg">
               </div>

               <div class="col-md-6">
                  <input type="hidden" name="movie_id">

                  <div class="form-group">
                     <label for="title" class="col-xs-3 control-label">Title:</label>
                     <div class="col-xs-9">
                        <input type="text" class="form-control" name="title" placeholder="Fight Club"/>
                     </div>
                  </div>

                  <div class="form-group">
                     <label for="year" class="col-xs-3 control-label">Year:</label>
                     <div class="col-xs-9">
                        <input type="number" class="form-control" name="year" min="1850" max="2150" placeholder="1999"/>
                     </div>
                  </div>

                  <div class="form-group">
                     <label for="rating" class="col-xs-3 control-label">Rating:</label>
                     <div class="col-xs-9">
                        <div class="input-group">
                           <input type="number" class="form-control" name="rating" min="0" max="10" step="0.1" placeholder="8.3"/>
                           <span class="input-group-addon"><span class="glyphicon glyphicon-star" aria-hidden="true"></span></span>
                        </div>
                     </div>
                  </div>

                  <div class="form-group">
                     <label class="col-xs-3 control-label">Runtime:</label>
                     <div class="col-xs-9">
                        <div class="form-group row" id="runtime">
                           <div class="col-xs-12">
                              <div class="input-group">
                                 <input type="number" name="hours" class="form-control" min="0" max="10" placeholder="2"/>
                                 <span class="input-group-addon hidden-xs hidden-md hidden-lg">hours</span><span class="input-group-addon hidden-sm">h</span>
                                 <input type="number" name="minutes" class="form-control" min="0" max="59" placeholder="19"/>
                                 <span class="input-group-addon hidden-xs hidden-md hidden-lg" id="mins">mins</span><span class="input-group-addon hidden-sm">m</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div class="form-group hidden">
                     <input hidden type="text" name="starring"/>
                  </div>

                  <div class="form-group">
                     <label for="director" class="col-xs-3 control-label">Director:</label>
                     <div class="col-xs-9">
                        <input type="text" class="form-control" name="director" placeholder="David Fincher"/>
                     </div>
                  </div>

                  <div class="form-group">
                     <label for="genres" class="col-xs-3 control-label">Genres:</label>
                     <div class="col-xs-9">
                        <select class="form-control" name="genres[]" multiple></select>
                     </div>
                  </div>

                  <div class="form-group hidden">
                     <input hidden type="text" name="imdb"/>
                  </div>

                  <div class="form-group">
                     <label for="overview" class="col-xs-3 control-label">Overview:</label>
                     <div class="col-xs-9">
                        <textarea class="form-control" name="overview" rows="3" placeholder="A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground fight clubs forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion."></textarea>
                     </div>
                  </div>

                  <div class="form-group hidden">
                     <input hidden type="text" name="poster"/>
                  </div>

                  <div class="form-group">
                     <label for="quality" class="col-xs-3 control-label">Quality:</label>
                     <div class="col-xs-9">
                        <select class="form-control" name="quality">
                              <option>1080p</option>
                              <option>720p</option>
                              <option>480p</option>
                              <option>360p</option>
                           </select>
                     </div>
                  </div>

                  <div class="form-group">
                     <label for="checkbox-seen" class="col-xs-3 control-label">Seen:</label>
                     <div class="col-xs-9">
                        <input type="checkbox" id="checkbox-seen" name="seen" class="sr-only"/>
                        <label for="checkbox-seen" id="checkbox-icon"></label>
                     </div>
                  </div>
               </div>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
               <button type="button" class="btn btn-primary" data-dismiss="modal" id="btn-submit" data-action="create">Add Movie</button>
            </div>
         </div>
      </div>
   </div>

   <div id="alert-placeholder"></div>
      
   <div class="container">
      <div class="panel panel-default">
         <div class="panel-heading">
            <div class="container-fluid table-toolbar">
               <button type="button" class="btn btn-primary pull-left" data-toggle="modal" data-target="#modal" id="btn-create">Add a Movie</button>
               <div class="form-group has-feedback pull-right">
                  <input type="text" class="form-control" id="table-search" placeholder="Search">
                  <span id="clear-table-search" class="glyphicon glyphicon-remove-circle form-control-feedback"></span>
               </div>
            </div>
         </div>

         <div class="table-responsive">
            <table id="movie-table" class="table table-bordered table-condensed table-hover text-center">
               <thead>
                  <tr>
                     <th data-asc="true" data-sorted="false"><span class="glyphicon glyphicon-eye-close"></span><span class="sr-only">Seen</span></th>
                     <th data-asc="true" data-sorted="false">Title<span class="glyphicon glyphicon-triangle-top"></span></th>
                     <th data-asc="false" data-sorted="false">Year<span class="glyphicon glyphicon-triangle-bottom"></span></th>
                     <th data-asc="false" data-sorted="false">Rating<span class="glyphicon glyphicon-triangle-bottom"></span></th>
                     <th data-asc="true" data-sorted="false">Runtime<span class="glyphicon glyphicon-triangle-top"></span></th>
                     <th>Actions</th>
                  </tr>
               </thead>
               <tbody>
               </tbody>
            </table>
         </div>

         <div id="progress-bar" class="panel-body">
            <h3>Fetching movies from database</h3>
            <div class="progress">
               <div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div>
            </div>
         </div>
      </div>
   </div>

   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
   <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
      crossorigin="anonymous"></script>
   <script src="js/script.js"></script>
</body>

</html>