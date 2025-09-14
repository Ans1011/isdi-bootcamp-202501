import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router'
import { logic } from '../../logic/index.js'
import { useContext } from '../../context.js'



export function TimerOn({ onReturnAccepted, onGiveUpClick, onFinishClick, onAddExtraTime }) {
    const { alert, confirm } = useContext()

    const navigate = useNavigate()
    const [time, setTime] = useState()
    const [extraTime, setExtraTime] = useState(5)
    const [initialTime, setInitialTime] = useState()
    const [status, setStatus] = useState('')
    const [intervalId, setIntervalId] = useState(null)
    const [pauseCountdown, setPauseCountdown] = useState()

    const [pauseIntervalId, setPauseIntervalId] = useState(null)

    const { timerId } = useParams()
    const localTimeKey = `timer-${timerId}-time`
    const localPauseTimeKey = `timer-${timerId}-pauseTime`

    useEffect(() => {
        console.debug('useEffect TimerOn')
        try {
            const savedTime = localStorage.getItem(localTimeKey)
            const savedStatus = localStorage.getItem(`${localTimeKey}-status`)

            if (savedStatus === 'end') {
                setStatus('end')
                setTime(0)
                return
            }

            if (savedTime !== null) {
                setTime(parseInt(savedTime, 10))
            }

            logic.getTimer(timerId)
                .then(timer => {
                    if (savedTime === null) {
                        setTime(timer.time * 60)

                    }
                    setInitialTime(timer.time)
                    setStatus(timer.status)

                    const savedPauseCountdown = localStorage.getItem(localPauseTimeKey)
                    if (savedPauseCountdown) {
                        setPauseCountdown(parseInt(savedPauseCountdown, 10))
                    } else {
                        setPauseCountdown(parseInt(timer.pauseTime, 10) * 60)
                    }

                    if (timer.status === 'active') {
                        startInterval()
                    }
                })
                .catch(error => {
                    console.error(error)
                    alert(error.message)
                })
        } catch (error) {
            console.error(error)
            alert(error.message)
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
            if (pauseIntervalId) clearInterval(pauseIntervalId)
        }
    }, [timerId])


    useEffect(() => {
        if (status === 'pause' && pauseCountdown > 0 && !pauseIntervalId) {
            startPauseCountdown()
        }
    }, [status, pauseCountdown])


    useEffect(() => {
        if (time !== undefined) {
            localStorage.setItem(localTimeKey, time)
        }
    }, [time])

    useEffect(() => {
        if (pauseCountdown !== undefined) {
            localStorage.setItem(localPauseTimeKey, pauseCountdown)
        }
    }, [pauseCountdown])



    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = timeInSeconds % 60
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const startInterval = () => {
        if (intervalId) return
        const interval = setInterval(() => {
            setTime(prevTime => {
                if (prevTime > 1) {
                    return prevTime - 1
                } else {
                    clearInterval(interval)
                    setStatus('end')
                    localStorage.setItem(`${localTimeKey}-status`, 'end')
                    localStorage.removeItem(localTimeKey)
                    return 0
                }
            })
        }, 1000)
        setIntervalId(interval)
    }

    const startPauseCountdown = () => {
        if (pauseIntervalId) return

        const interval = setInterval(() => {
            setPauseCountdown(prev => {
                if (prev > 1) {
                    return prev - 1
                } else {
                    clearInterval(interval)
                    setPauseIntervalId(null)
                    localStorage.removeItem(localPauseTimeKey)

                    logic.resumeTimer(timerId)
                        .then(() => {
                            setStatus('active')
                            startInterval()
                        })
                        .catch(error => {
                            console.error(error)
                            alert(error.message)
                        })

                    return 0
                }
            })
        }, 1000)

        setPauseIntervalId(interval)
    }


    const handleReturnClick = () => {
        confirm('Are you sure to return?')
            .then(accepted => {
                if (accepted) {
                    try {
                        logic.deleteTimer(timerId)
                            .then(() => {
                                localStorage.removeItem(localTimeKey)
                                localStorage.removeItem(`${localTimeKey}-status`)
                                onReturnAccepted()
                            })
                            .catch(error => {
                                console.error(error)
                                alert(error.message)
                            })

                    } catch (error) {
                        console.error(error)
                        alert(error.message)
                    }
                }
            })
    }

    const handleStartClick = () => {
        try {
            logic.startTimer(timerId)
                .then(() => {
                    logic.getTimer(timerId)
                        .then(timer => {
                            setStatus(timer.status)
                        })
                })
                .catch(error => {
                    console.error(error)
                    alert(error.message)
                })

            startInterval()

        } catch (error) {
            console.error(error)
            alert(error.message)
        }
    }

    const handleGiveUpClick = () => {
        confirm(`Are you sure you want to give up? If you do, you will lose ${initialTime} gems.`)
            .then(accepted => {
                if (accepted) {
                    try {
                        logic.exitTimer(timerId)
                            .then(() => {
                                localStorage.removeItem(`timer-${timerId}-time`)
                                localStorage.removeItem(`timer-${timerId}-pauseTime`)
                                localStorage.removeItem(`timer-${timerId}-status`)
                                localStorage.removeItem(localTimeKey)
                                localStorage.removeItem(`${localTimeKey}-status`)
                                onGiveUpClick()
                            })
                            .catch(error => {
                                console.error(error)
                                alert(error.message)
                            })

                    } catch (error) {
                        console.error(error)
                        alert(error.message)
                    }
                }
            })
    }

    const handlePauseClick = () => {
        try {
            clearInterval(intervalId)
            setIntervalId(null)

            if (pauseIntervalId) {
                clearInterval(pauseIntervalId)
                setPauseIntervalId(null)
            }

            logic.pauseTimer(timerId)
                .then(() => {
                    logic.getTimer(timerId)
                        .then(timer => {
                            setStatus(timer.status)

                            const pauseSeconds = parseInt(timer.pauseTime, 10) * 60
                            setPauseCountdown(pauseSeconds)
                            localStorage.setItem(localPauseTimeKey, pauseSeconds)

                            startPauseCountdown()
                        })
                })
                .catch(error => {
                    console.error(error)
                    alert(error.message)
                })

        } catch (error) {
            console.error(error)
            alert(error.message)
        }
    }


    const handleResumeClick = () => {
        try {
            if (pauseIntervalId) {
                clearInterval(pauseIntervalId)
                setPauseIntervalId(null)
            }

            localStorage.removeItem(localPauseTimeKey)

            logic.resumeTimer(timerId)
                .then(() => {
                    logic.getTimer(timerId)
                        .then(timer => {
                            setStatus(timer.status)
                            startInterval()
                        })
                })
                .catch(error => {
                    console.error(error)
                    alert(error.message)
                })
        } catch (error) {
            console.error(error)
            alert(error.message)
        }
    }


    const handleEndClick = () => {
        confirm(`If you end now, you are gone a win ${initialTime} gems`)
            .then(accepted => {
                if (accepted) {
                    try {
                        logic.endTimer(timerId)
                            .then(() => {
                                onFinishClick()
                                localStorage.removeItem(localTimeKey)
                                localStorage.removeItem(localPauseTimeKey)
                                localStorage.removeItem(`${localTimeKey}-status`)
                                localStorage.removeItem(`timer-${timerId}-time`)
                                localStorage.removeItem(`timer-${timerId}-pauseTime`)
                                localStorage.removeItem(`timer-${timerId}-status`)
                            })
                            .catch(error => {
                                console.error(error)
                                alert(error.message)
                            })

                    } catch (error) {
                        console.error(error)
                        alert(error.message)
                    }
                }
            })

    }

    const handleExtraTimeClick = () => {
        logic.getTimer(timerId)
            .then(timer => {
                setInitialTime(timer.time)
                setStatus('setExtraTime')

            })
            .catch(error => {
                console.error(error)
                alert(error.message)
            })

    }

    const handleExtraTimeStartClick = () => {
        try {
            logic.addExtraTime(timerId, extraTime)
                .then(() => {
                    localStorage.removeItem(`timer-${timerId}-status`)
                    onAddExtraTime(timerId)

                })
                .catch(error => {
                    console.error(error)
                    alert(error.message)
                })
        } catch (error) {
            console.error(error)
            alert(error.message)
        }

    }


    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    console.debug('TimerOn -> render')

    return (
        <div className="flex flex-col items-center mt-10 space-y-6 text-center">

            {status === 'created' && (<h3 className="text-2xl font-bold text-green-800 animate-fade-in">✨ Ready to start!</h3>)}

            {status === 'active' && (<h3 className="text-2xl font-bold text-fuchsia-900 animate-pulse"> Working...</h3>)}

            {status === 'pause' && (<h3 className="text-2xl font-bold text-yellow-700 animate-fade-in"> Resting</h3>)}

            {status === 'end' && (<h3 className="text-2xl font-bold text-fuchsia-700 animate-bounce">⏰ Time's up! 🎉</h3>)}

            {status !== 'setExtraTime' && (
                <h1 className="text-5xl font-mono font-bold text-gray-800">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds} min
                </h1>
            )}

            {status === 'pause' && (
                <div className="flex flex-col space-y-6 items-center justify-center w-[280px] h-[380px] bg-amber-200 rounded-xl shadow-lg p-6 border-2 border-yellow-600">
                    <h1 className="text-4xl font-bold text-fuchsia-900">{formatTime(pauseCountdown)}</h1>
                    <p className="text-8xl p-2">⏸️</p>
                    <button
                        type="button"
                        onClick={handleResumeClick}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                    >
                        Resume
                    </button>
                </div>
            )}

            {(status === 'active' || status === 'created') && <div className="sand-clock scale-100 mt-4" />}

            {status === 'setExtraTime' && (
                <div className="flex flex-col items-center justify-center w-[400px] h-[550px] bg-yellow-50 rounded-2xl shadow-xl p-6 space-y-8 text-center border-4 border-fuchsia-900">
                    <h2 className="text-3xl font-bold text-fuchsia-900">Add Extra Time</h2>
                    <label htmlFor="timeExtra" className="text-xl font-semibold text-yellow-600">
                        Select extra minutes:
                    </label>
                    <input
                        type="number"
                        id="timeExtra"
                        min={5}
                        max={240 - initialTime}
                        step={5}
                        value={extraTime}
                        onChange={e => setExtraTime(Number(e.target.value))}
                        className="w-[180px] text-2xl px-4 py-2 border-2 border-red-900 rounded-lg text-center text-fuchsia-900 font-bold bg-white"
                    />
                    <div className="text-xl text-gray-800 space-y-2">
                        <p><strong className="text-fuchsia-900">Run Time:</strong> {initialTime} min</p>
                        <p><strong className="text-red-900">Total Time:</strong> {initialTime + extraTime} min</p>
                        <p className="text-base text-red-600 italic">(Limit: 240 min)</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExtraTimeStartClick}
                        className="w-full h-[48px] bg-fuchsia-900 text-white text-lg font-semibold rounded-xl shadow hover:bg-fuchsia-700 transition-all flex items-center justify-center"
                    >
                        Start Extra Time
                    </button>

                    <button
                        type="button"
                        onClick={handleEndClick}
                        className="px-6 py-2 bg-green-800 text-white rounded-lg shadow hover:bg-green-700 transition-all"
                    >
                        Finish
                    </button>
                </div>
            )}

            {status === 'created' && (
                <div className="flex space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleStartClick}
                        className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition-all"
                    >
                        Start
                    </button>
                    <button
                        type="button"
                        onClick={handleReturnClick}
                        className="px-6 py-2 bg-red-800 text-white rounded-lg shadow hover:bg-red-900 transition-all"
                    >
                        Return
                    </button>
                </div>
            )}

            {(status === 'active' || status === 'extraTime') && (
                <div className="flex space-x-4 mt-5 mb-4">
                    <button
                        type="button"
                        onClick={handlePauseClick}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition-all"
                    >
                        Pause
                    </button>
                    <button
                        type="button"
                        onClick={handleGiveUpClick}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
                    >
                        Give up
                    </button>
                </div>
            )}

            {status === 'pause' && (
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleGiveUpClick}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
                    >
                        Give up
                    </button>
                </div>
            )}

            {status === 'end' && (
                <div className="flex space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleExtraTimeClick}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition-all"
                    >
                        Add extra time
                    </button>
                    <button
                        type="button"
                        onClick={handleEndClick}
                        className="px-6 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition-all"
                    >
                        Finish
                    </button>
                </div>
            )}
        </div>
    )
}

