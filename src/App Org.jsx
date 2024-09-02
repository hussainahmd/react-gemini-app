import { useState, useEffect } from 'react'

function App() {
    const [image, setImage] = useState(null)
    const [imageURL, setImageURL] = useState("")
    const [value, setValue] = useState("")
    const [response, setResponse] = useState("")
    const [error, setError] = useState("")

    const surpriseOptions = [
        'Does the image have a bird?',
        'Is the image fabulously pink?',
        'Does the image have puppies?'
    ]

    const surprise = () => {
        const randValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)]
        setValue(randValue)
    }

    const uploadImage = async (e) => {
        const file = e.target.files[0]
        if (file) {
            const formData = new FormData()
            formData.append('file', file)

            setImage(file)
            setImageURL(URL.createObjectURL(file))


            try {
                const options = {
                    method: 'POST',
                    body: formData
                }
                const response = await fetch('http://localhost:8000/upload', options)
                const data = await response.json()
                console.log(data)
            } catch (err) {
                console.error(err)
                setError("Something didn't work! Please try again.")
            }
        }
        else {
            setError('Error occured uploading the image! Try again.')
        }
    }

    const analyzeImage = async () => {
        if (!image) {
            setError('Error! Must have an existing image.')
            return
        }

        try {
            const options = {
                method: 'POST',
                body: JSON.stringify({ message: value }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const response = await fetch('http://localhost:8000/gemini', options)
            const data = await response.text()
            setResponse(data)
        } catch (err) {
            console.error(err)
            setError("Something didn't work! Please try again.")
        }
    }

    const clear = () => {
        setImage(null)
        setImageURL('')
        setResponse('')
        setError('')
        setValue('')
    }

    useEffect(() => {
        // Cleanup the URL when the component is unmounted or when the image changes
        return () => {
            if (imageURL) {
                URL.revokeObjectURL(imageURL)
            }
        }
    }, [imageURL])

    return (
        <>
            <div className="app">
                <section className="search-section">
                    <div className="image-container">
                        <label htmlFor="files" className='upload-label'>
                            <img id='img' src={image ? imageURL : '/src/assets/placeholder-img.png'} />
                            <div className="upload">
                                <p>Upload an image to ask questions about.</p>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h360q-20 26-30 57t-10 63q0 83 58.5 141.5T720-520q32 0 63-10t57-30v360q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" /></svg>
                            </div>
                        </label>
                        <input onChange={uploadImage} id="files" type="file" accept="image/*" hidden />
                    </div>

                    <div className="mid-container">
                        <div className='mid-2'>
                            <p>What do you want to know about the image?</p>
                            <button onClick={surprise} >
                                Surprise me
                            </button>
                        </div>
                        <div className="mid-2">
                            <input type="text"
                                value={value}
                                placeholder="What is in the image..."
                                onChange={e => setValue(e.target.value)}
                            />
                        </div>
                        <div className="mid-2 btns">
                            <button className="btn" onClick={analyzeImage} >Ask me</button>
                            <button className='btn' onClick={clear}>Clear</button>
                        </div>

                        {error && <p className='response'>{error}</p>}
                        {response && <p className='response'>{response}</p>}
                    </div>
                </section>

            </div>
        </>
    )
}

export default App
