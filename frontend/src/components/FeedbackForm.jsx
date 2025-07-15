import React from 'react'
import { useState } from 'react'
import '../App.css'

const FeedBackForm = ({ onSubmit }) => {
    const [name, setName] = useState('')
    const [feedback, setFeedback] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name || !feedback) return;
        onSubmit({ name, feedback })
        setName('')
        setFeedback('')
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type='text'
                placeholder="Your Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{resize: 'none'}}
            />
            <button type="submit">Submit Feedback</button>
        </form>
    )
}

export default FeedBackForm