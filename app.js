const express = require('express') //commonJS
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const app = express()


// metodods normales GET/HEAD/POST
// metodos complejos PUT/PATCH/DELETE

// CORS Pre-Flight
// OPTIONS

app.disable('x-powered-by')
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234'
        ]

        if(ACCEPTED_ORIGINS.includes(origin)){
            return callback(null, true)
        }

        if(!origin) {
            return callback(null, true)
        }

        return callback( new Error('Not allowed by CORS'))
    }
})) //por defecto lo pone todo con *
app.use(express.json())



//todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {


    
    const { genre } = req.query
    if (genre) {
      const filteredMovies = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
      return res.json(filteredMovies)
    }
    res.json(movies)
  })

//recuperar MOVIES por id es un segmento dinamico
app.get('/movies/:id', (req, res) => { //path-to-regexp
    const { id } = req.params
    const movie = movies.find(movie => movie.id == id)
    if (movie) return res.json(movie)

    res.status(404).json({message: 'movie not found'})
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
  
    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    // en base de datos
    const newMovie = {
      id: crypto.randomUUID(), // uuid v4
      ...result.data
    }
  
    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie)
  
    res.status(201).json(newMovie)
  })

app.delete('/movies/:id', (req, res) => {

    const { id } = req.params
    const movieindex = movies.findIndex(movie => movie.id == id)

    if (movieindex == -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieindex, 1)

    return res.json({message: 'Movie deleted'})

})

//Actualizar una pelicula PUT lo actualizaria todo, PATCH solo actualiza una parte
app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if(!result) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const { id } = req.params
    const movieindex = movies.findIndex(movie => movie.id == id)

    
    if (movieindex == -1) {
        return res.status(404).json({message: 'Movie not found'})
    }
    console.log(movies[movieindex])
    console.log(result.data)
    const updateMovie = {
        ...movies[movieindex],
        ...result.data
    }
    movies[movieindex] = updateMovie

    return res.json(updateMovie)
    

})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`Listen on port http://localhost:${PORT}`)
})

