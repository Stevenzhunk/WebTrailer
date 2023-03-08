import axios from 'axios'
import './App.css';
import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

function App() {
  const API_URL = "https://api.themoviedb.org/3";
  const API_KEY = "ca2da466f42a115d1e85b3a9abfb1d3f";
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original";

  // endpoint para las imagenes
  const URL_IMAGE = "https://image.tmdb.org/t/p/original";

  //estados
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [probe, setProbe]= useState(true)
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);

  // esta funcion sirve para la peticion get a la APPI 
  const fetchMovies = async (searchKey) => {
    const type = searchKey ? "search" : "discover";
    const {
      data: { results },
    } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: API_KEY,
        query: searchKey,
      },
    });

    setMovies(results);
    setMovie(results[0]);

    if (results.length) {
      await fetchMovie(results[0].id);
    }
  };

  //funcion peticion de una sola pelicula y mostrar en reproductor youtube
  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        append_to_response: "videos", // es la forma de esta query busca si existe o no existe (documentacion appi)
      },
    });

    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (vid) => vid.name === "Official Trailer"
      );
      setTrailer(trailer ? trailer : data.videos.results[0]);
    }
    setMovie(data);
  };

  const selectMovie = async (movie) => {
    fetchMovie(movie.id); //peticion le pasamos el id para buscar la movie
    setMovie(movie); // guarde la pelicula actual
    window.scrollTo(0, 0);
  };

  // funcion buscador y boton con prevenir evento
  const searchMovies = (e) => {
    e.preventDefault(); //la variable capturada en el estado que se desea capturar
    fetchMovies(searchKey);
  };

  useEffect(() => {
    fetchMovies();
  }, []);


  return (
    <div>
      {playing? (''):(<div className="encabezado"> {/* Controlador si esta en play desaparece buscador y h2 */}
        <h2 className="text-center mt-5">Trailers Latest Trending Movies </h2>
        {/* el buscador */}
        <div className="searcher-bar">
          <form className="container mb-4" onSubmit={searchMovies}>
            <input
              className="input-text-placeholder"
              type="text"
              placeholder="Search movie"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <button className="buton-search">Search</button>
          </form>
        </div>
      </div>) }

      <div>
        <main>
          {movie ? (
            <div
              className="viewtrailer"
              style={{
                backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
              }}
            >
              {playing ? (
                <>
                  <YouTube //libreria youtube (leer documentacion)
                    videoId={trailer.key} // le pasamos la id para que busque
                    className="reproductor container"
                    containerClassName={"youtube-container "}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }} //tamaños y ajustes 
                  />
                  <button onClick={() => setPlaying(false)} className="boton"> {/* habilitamos el reproductor al cambio*/}
                    Close
                  </button>
                </>
              ) : ( 
                <div className="container">
                  <div className="">
                    {trailer ? (
                      <button
                        className="boton"
                        onClick={() => setPlaying(true) }
                        type="button"
                      >
                        Play Trailer
                      </button>
                    ) : (
                      <p className="not-found">"Sorry, no trailer available"</p>
                    )}
                    <h1 className="text-white">{movie.title}</h1>
                    <p className="text-white">{movie.overview}</p>
                  </div>
                </div>
                
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/*contenedor de peliculas actuales */}
      <div className="container mt-3">
        <div className="row">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="col-md-4 mb-3"
              onClick={() => selectMovie(movie)}
            >
              <img
                src={`${URL_IMAGE + movie.poster_path}`}
                alt=""
                height={500}
                width="90%"
              />
              <h4 className="text-center">{movie.title}</h4>
            </div>
          ))}
        </div>
      </div>
      <hr></hr>
      <p className="footer-text"> Realizado con TMDB y react-youtube, con deploy en AWS (Amazon Cloud) - Luis Becerra © Proyecto personal sin lucro </p>
    </div>
  );
}

export default App;