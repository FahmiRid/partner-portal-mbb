import React from 'react'

export default function NotFoundPage() {
    return (
        <div>
            <div className="py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-search text-muted mb-3" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
                <h6 className="text-muted">No products found</h6>
                <p className="text-muted small">Try adjusting your search criteria</p>
            </div>
        </div>
    )
}
