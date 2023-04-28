import { intersectionBy } from "lodash";
import type { Movie, Actor } from "./types";
import "./main.scss";

const API_KEY = "5951b0e75bc5b7e7edec1d492ae68521";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/original";

// #1 is a function that selects a single element.
// #2 is a function that selects multiple elements and adds them to an array.
const $ = (el) => document.querySelector(el);
const $$ = (el) => Array.from(document.querySelectorAll(el));

/**
 * @param {Array<String>} actorNames List of actor's names
 * @returns A list of movies that are common between two or more actors
 */
async function getActorMovieIntersection(actorNames: string[]) {
  let movieMasterList: Movie[][] = [];
  for (const actorName of actorNames) {
    let movies = await getMoviesByActorName(actorName);
    movieMasterList.push(movies);
  }
  // intersectionBy is a Lodash function
  // returns the intersection of the movieMasterList, which is a list of all movie lists that have been obtained from the actor inputs
  return intersectionBy(...movieMasterList, "id");
}

/**
 * @param actorName is a string
 * @returns Gets list of movies for one actor
 */
async function getMoviesByActorName(actorName: string) {
  let actor = await getActor(actorName);
  let movieList = await getMovieList(actor.id);
  return movieList;
}

/**
 * Gets list of actors and returns first actor from list
 * @param actorName is a string
 * @returns An actor from the top of a list of searched actors
 */
async function getActor(actorName: string): Promise<Actor> {
  let result = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      actorName
    )}&page=1&include_adult=true`
  );
  let actorList = await result.json();
  if (actorList.results.length === 0) {
    alert(`No results found for ${actorName}`);
    throw new Error("No actor found");
  }
  return actorList.results[0];
}

/**
 * Gets list of movies from actor's ID
 * @param actorID is a number
 * @returns A list of movies in which an actor is in the cast
 */
async function getMovieList(actorID: number): Promise<Movie[]> {
  let result = await fetch(
    `https://api.themoviedb.org/3/person/${actorID}/movie_credits?api_key=${API_KEY}&language=en-US`
  );
  let data = await result.json();
  return data.cast;
}

/**
 * Converts movie data to HTML
 * @param movie is an object
 * @returns HTML card with API data as a string
 */
const getMovieHTML = (movie: Movie) =>
  `
  <div class="card">
  <section>
    <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
    <img src="${POSTER_BASE_URL}${movie.poster_path}"/>
    </a>
  </section>
  <section>
    <h3>${movie.title}</h3>
    <span>${movie.release_date}</span>
    <br>
    <span>Score: ${movie.vote_average * 10}%</span>
  </section>
</div>
`;

// Submit button code
// On click, selects the input fields' input,
$("#btnSubmit").addEventListener("click", async () => {
  let inputFields = $$("#actor_input input");
  let actorNames = inputFields.map((f) => f.value.trim());
  if (actorNames.includes("")) return;
  let intersection = await getActorMovieIntersection(actorNames);
  if (intersection.length === 0) {
    $("#results").innerHTML = "No movies found for selected actors.";
  } else {
    console.log(intersection);
    $("#results").innerHTML = intersection.map(getMovieHTML).join("");
  }
});
// Input count controls
// On click, creates an input element and assigns it to "input", the input needs to have a placeholder element "Input Actor Name" for the input box to show the text, and the input element is appended to the #actor_input id.
$("#btnAdd").addEventListener("click", () => {
  let input = document.createElement("input");
  input.setAttribute("placeholder", "Input Actor Name");
  $("#actor_input").appendChild(input);
});

$("#btnSubtract").addEventListener("click", () => {
  if ($("#actor_input").childElementCount === 2) return;
  $("#actor_input input:last-child").remove();
});
