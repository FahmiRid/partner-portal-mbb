import React from 'react'

export default function Footer() {
    return (
        <div>
            <footer className="bg-dark text-white py-3 text-center">
                <div className="container">
                    <small>&copy; {new Date().getFullYear()} Maybank Group. All rights reserved.</small>
                </div>
            </footer>
        </div>
    )
}
