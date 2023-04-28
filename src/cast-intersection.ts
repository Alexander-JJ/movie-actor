import { intersectionBy } from "lodash";
import type { Cast, Movie } from "./types";
import "./main.scss";

const API_KEY = "5951b0e75bc5b7e7edec1d492ae68521";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/original";

// #1 is a function that selects a single element.
// #2 is a function that selects multiple elements and adds them to an array.
const $ = (el) => document.querySelector(el);
const $$ = (el) => Array.from(document.querySelectorAll(el));

/**
 * @param {Array<String>} movieNames List of actor's names
 * @returns A list of movies that are common between two or more actors
 */
async function getActorMovieIntersection(movieNames: string[]) {
  let castMasterList: Cast[][] = [];
  for (const movieName of movieNames) {
    let cast = await getCastByMovieName(movieName);
    castMasterList.push(cast);
  }
  // intersectionBy is a Lodash function
  // returns the intersection of the movieMasterList, which is a list of all movie lists that have been obtained from the actor inputs
  return intersectionBy(...castMasterList, "id");
}

/**
 * @param movieName is a string
 * @returns the cast of a movie
 */
async function getCastByMovieName(movieName: string) {
  let movie = await getMovie(movieName);
  let castList = await getCast(movie.id);
  return castList;
}

/**
 * Gets list of movies and returns first movie from list
 * @param movieName is a string
 * @returns a movie from the top of the queried list of movies
 */
async function getMovie(movieName: string): Promise<Cast> {
  let result = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      movieName
    )}&page=1&include_adult=false`
  );
  let movieList = await result.json();
  if (movieList.results.length === 0) {
    alert(`No results found for ${movieName}`);
    throw new Error("No movie found");
  }
  return movieList.results[0];
}

/**
 * Gets cast from movie's ID
 * @param castID is a number
 * @returns the cast of a movie
 */
async function getCast(castID: number): Promise<Cast[]> {
  let result = await fetch(
    `https://api.themoviedb.org/3/person/${castID}/movie_credits?api_key=${API_KEY}&language=en-US`
  );
  let data = await result.json();
  return data.cast;
}

/**
 * Converts cast data to HTML
 * @param cast is an object
 * @returns HTML card with API data as a string
 */
const getCastHTML = (cast: Cast) =>
  `
  <div class="card">
  <section>
    <a href="https://www.themoviedb.org/movie/${cast.id}" target="_blank">
    <img src="${POSTER_BASE_URL}${cast.poster_path}"/>
    </a>
  </section>
  <section>
    <h3>${cast.title}</h3>
    <span>${cast.release_date}</span>
    <br>
    <span>Score: ${cast.vote_average * 10}%</span>
  </section>
</div>
`;

// Submit button code
// On click, selects the input fields' input,
$("#btnSubmit").addEventListener("click", async () => {
  let inputFields = $$("#movie_input input");
  let movieNames = inputFields.map((f) => f.value.trim());
  if (movieNames.includes("")) return;
  let intersection = await getActorMovieIntersection(movieNames);
  if (intersection.length === 0) {
    $("#results").innerHTML = "No cast found for selected movies.";
  } else {
    console.log(intersection);
    $("#results").innerHTML = intersection.map(getCastHTML).join("");
  }
});
// Input count controls
// On click, creates an input element and assigns it to "input"
// The input needs to have a placeholder element "Input Actor Name" for the input box to display the text.
// The input element is appended to the #actor_input id.
$("#btnAdd").addEventListener("click", () => {
  let input = document.createElement("input");
  input.setAttribute("placeholder", "Input Movie Name");
  $("#movie_input").appendChild(input);
});

$("#btnSubtract").addEventListener("click", () => {
  if ($("#movie_input").childElementCount === 2) return;
  $("#movie_input input:last-child").remove();
});
