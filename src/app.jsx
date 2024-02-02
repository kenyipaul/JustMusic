/* eslint-disable no-unused-vars */
import React from "react"
import { useRef } from "react"
import { useContext } from "react"
import { useState } from "react"
import { useEffect } from "react"

const AllSongsContext = React.createContext(null)
const PlaylistContext = React.createContext(null)
const CurrentSongContext = React.createContext(null)

export default function App() {

    const player = useRef()

    const [allSongs, setAllSongs] = useState([])
    const [isPlaying, setIsPlaying] = useState(false)
    const [listState, setListState] = useState(false)
    const [currentSong, setCurrentSong] = useState({})

    useEffect(() => {

        fetch('/assets/songs.json').then(response => {
            response.json().then((data) => {
                setAllSongs(data)
                setCurrentSong(data[0])
            })
        })

        player.current.addEventListener('loadedmetadata', () => {
            let minutes = Math.floor((player.current.duration % 3600) / 60)
            let hours = Math.floor(player.current.duration / 3600)
            let seconds = Math.floor(player.current.duration % 60)
            
            document.querySelector('.counter #range').value = (player.current.currentTime / player.current.duration) * 100
            document.querySelector('.counter .total').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })
        
        player.current.addEventListener('timeupdate', () => {
            let minutes = Math.floor((player.current.currentTime % 3600) / 60)
            let hours = Math.floor(player.current.currentTime / 3600)
            let seconds = Math.floor(player.current.currentTime % 60)

            document.querySelector('.counter #range').value = (player.current.currentTime / player.current.duration) * 100
            document.querySelector('.counter .remain').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })


    }, [])


    const prevSong = () => {

        let current = allSongs.indexOf(currentSong) - 1
        setCurrentSong(allSongs[current])
        
        player.current.addEventListener('loadedmetadata', () => {
            playSong()
        })
        
    }
    
    const nextSong = () => {
        
        let current = allSongs.indexOf(currentSong) + 1
        setCurrentSong(allSongs[current])

        player.current.addEventListener('loadedmetadata', () => {
            playSong()
        })

    }

    const playSong = () => {
        setIsPlaying(true)
        player.current.play()
    }
    
    const pauseSong = () => {
        setIsPlaying(false)
        player.current.pause()
    }

    const seek = (e) => {
        var time = player.current.duration * (e.target.value / 100)
        player.current.currentTime = time
    }

    return (
        <PlaylistContext.Provider value={[listState, setListState]}>
        <AllSongsContext.Provider value={[allSongs, setAllSongs]}>
        <CurrentSongContext.Provider value={[currentSong, setCurrentSong]}>
            <div id="app">
            
                <header>
                    <h1>{currentSong ? currentSong.name : 'Awkward Silence'}</h1>
                    <h4>{currentSong ? currentSong.artist : 'Unknown Artist'}</h4>
                </header>

                <audio ref={player} src={`/music/${currentSong && currentSong.url ? currentSong.url : ''}`} controls></audio>

                <div className="cover"></div>
                <div className="controls">

                    <div className="counter">
                        <p className="remain">00:00</p>
                        <input onChange={seek} type="range" id="range" min="0" max="100" />
                        <p className="total">00:00</p>
                    </div>


                    <div className="button-area">
                        <section>
                            <button onClick={prevSong}><img src="/assets/images/prev.svg" /></button>
                            {
                                isPlaying ?
                                <button onClick={pauseSong}><img src="/assets/images/pause.svg" /></button>
                                : <button onClick={playSong}><img src="/assets/images/play.svg" /></button>
                            }
                            <button onClick={nextSong}><img src="/assets/images/next.svg" /></button>
                        </section>
                        <button onClick={() => setListState(!listState)}><img src="/assets/images/playlist.svg" /></button>
                    </div>

                </div>

                { listState ? <Playlist /> : <></> }

            </div>
        </CurrentSongContext.Provider>
        </AllSongsContext.Provider>
        </PlaylistContext.Provider>
    )
}

function Playlist() {

    const [allSongs, setAllSongs] = useContext(AllSongsContext)
    const [listState, setListState] = useContext(PlaylistContext)
    const [currentSong, setCurrentSong] = useContext(CurrentSongContext)

    return (
        <div className="playlist">
            <div className="header">
                <button onClick={() => setListState(false)}><img src="/assets/images/close.png"/></button>
                <h3>{allSongs ? allSongs.length : 0} Songs</h3>
            </div>
            <ul className="list">
                {
                    allSongs.map((data, key) => {
                        return (
                            <li key={key}><img onClick={() => { setCurrentSong(data); }} src="/assets/images/play.svg" /> <p>{data.name}</p></li>
                        )
                    })
                }
            </ul>
        </div>
    )
}