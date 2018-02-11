<?php
   session_start();
   require_once "sql_exe.php";

   $sqlSelectMovieById = "SELECT m.*, group_concat(g.genre ORDER BY g.genre ASC SEPARATOR ', ') as genres
                          FROM movies m
                          LEFT JOIN movie_genres mg
                          ON m.movie_id = mg.movie_id
                          LEFT JOIN genres g
                          ON g.genre_id = mg.genre_id
                          WHERE m.movie_id = :movie_id
                          GROUP BY m.movie_id";

   $sqlSelectMovies = "SELECT m.*, group_concat(g.genre ORDER BY g.genre ASC SEPARATOR ', ') as genres
                       FROM movies m
                       LEFT JOIN movie_genres mg
                       ON m.movie_id = mg.movie_id
                       LEFT JOIN genres g
                       ON g.genre_id = mg.genre_id
                       GROUP BY m.movie_id";

   if ($_SERVER["REQUEST_METHOD"] == "POST") {
      auth();
      checkParams($_POST, array("seen", "title", "year", "rating", "runtime", "starring", "director", "genres", "imdb", "overview", "poster", "quality"));
      $seen = $_POST["seen"];
      $title = $_POST["title"];
      $year = $_POST["year"];
      $rating = $_POST["rating"];
      $runtime = $_POST["runtime"];
      $starring = $_POST["starring"];
      $director = $_POST["director"];
      $genres = $_POST["genres"];
      $imdb = $_POST["imdb"];
      $overview = $_POST["overview"];
      $poster = $_POST["poster"];
      $quality = $_POST["quality"];

      $sqlInsertMovie = "INSERT INTO movies (seen, title, year, rating, runtime, starring, director, imdb, overview, poster, quality)
                        VALUES (:seen, :title, :year, :rating, :runtime, :starring, :director, :imdb, :overview, :poster, :quality)";
      $data = array(
         ':seen' => $seen,
         ':title' => $title,
         ':year' => $year,
         ':rating' => $rating,
         ':runtime' => $runtime,
         ':starring' => $starring,
         ':director' => $director,
         ':imdb' => $imdb,
         ':overview' => $overview,
         ':poster' => $poster,
         ':quality' => $quality
      );
      $lastInserted = sqlExecute($sqlInsertMovie, $data, false);
      
      addGenres($lastInserted, $genres);

      echo json_encode(sqlExecute($sqlSelectMovieById, array(':movie_id' => $lastInserted), true));
   }
   else if ($_SERVER["REQUEST_METHOD"] == "GET") {
      checkParams($_GET, array("table"));
      $table = $_GET["table"];

      if (strcmp($table, "genres") === 0) {
         $sqlResult = sqlExecute("SELECT * FROM genres", array(), true);
         echo json_encode($sqlResult);
      }
      else if (strcmp($table, "movies") === 0) {
         if (isset($_GET["movie_id"])) {
            $movie_id = $_GET["movie_id"];
            echo json_encode(sqlExecute($sqlSelectMovieById, array(':movie_id' => $movie_id), true));
         }
         else {
            echo json_encode(sqlExecute($sqlSelectMovies, array(), true));
         }
      }
   }
   else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
      auth();
      $_DELETE = array();
      parse_str(file_get_contents('php://input'), $_DELETE);
      checkParams($_DELETE, array("movie_id"));
      $movie_id = $_DELETE["movie_id"];

      $sqlDeleteMovie = "DELETE FROM movies WHERE movie_id = :movie_id";
      sqlExecute($sqlDeleteMovie, array(':movie_id' => $movie_id), false);

      deleteGenres($movie_id);
   }
   else if ($_SERVER["REQUEST_METHOD"] == "PUT") {
      auth();
      $_PUT = array();
      parse_str(file_get_contents('php://input'), $_PUT);
      checkParams($_PUT, array("movie_id", "seen", "title", "year", "rating", "runtime", "starring", "director", "genres", "imdb", "overview", "poster", "quality"));
      $movie_id = $_PUT["movie_id"];
      $seen = filter_var($_PUT["seen"], FILTER_VALIDATE_BOOLEAN);
      $title = $_PUT["title"];
      $year = $_PUT["year"];
      $rating = $_PUT["rating"];
      $runtime = $_PUT["runtime"];
      $starring = $_PUT["starring"];
      $director = $_PUT["director"];
      $genres = $_PUT["genres"];
      $imdb = $_PUT["imdb"];
      $overview = $_PUT["overview"];
      $poster = $_PUT["poster"];
      $quality = $_PUT["quality"];

      $sqlUpdateMovie = "UPDATE movies SET seen=:seen, title=:title, year=:year, rating=:rating, runtime=:runtime, starring=:starring, director=:director, imdb=:imdb, overview=:overview, poster=:poster, quality=:quality WHERE movie_id=:movie_id";
      $data = array(
         ':movie_id' => $movie_id,
         ':seen' => $seen,
         ':title' => $title,
         ':year' => $year,
         ':rating' => $rating,
         ':runtime' => $runtime,
         ':starring' => $starring,
         ':director' => $director,
         ':imdb' => $imdb,
         ':overview' => $overview,
         ':poster' => $poster,
         ':quality' => $quality
      );
      sqlExecute($sqlUpdateMovie, $data, false);
      
      deleteGenres($movie_id);
      addGenres($movie_id, $genres);

      echo json_encode(sqlExecute($sqlSelectMovieById, array(':movie_id' => $movie_id), true));
   }

   function auth() {
      if (!isset($_SESSION['user'])) {
         http_response_code(401);
         die();
      }
   }

   function checkParams($methodArray, $params) {
      foreach ($params as $param) {
         if (empty($methodArray[$param])) {
            http_response_code(406);
            die("$param");
         }
      }
   }

   function deleteGenres($movie_id) {
      $sqlDeleteGenres = "DELETE FROM movie_genres WHERE movie_id = :movie_id";
      sqlExecute($sqlDeleteGenres, array(':movie_id' => $movie_id), false);
   }

   function addGenres($movie_id, $genres) {
      $genrePlaceholders = implode(',', array_fill(0, count($genres), '?'));
      $sqlSelectGenres = "SELECT genre_id
                          FROM genres
                          WHERE genre IN ($genrePlaceholders)";
      $genre_ids = sqlExecute($sqlSelectGenres, $genres, true);

      $sqlInsertGenre = "INSERT INTO movie_genres (movie_id, genre_id) VALUES (:movie_id, :genre_id)";
      foreach($genre_ids as $genre_id) {
         $data = array(':movie_id' => $movie_id, ':genre_id' => $genre_id['genre_id']);
         sqlExecute($sqlInsertGenre, $data, false);
      }
   }
?>