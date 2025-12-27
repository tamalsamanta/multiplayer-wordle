export function getPlayerId() {
    if (typeof window === 'undefined') return null

    let id = localStorage.getItem('playerId')
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('playerId', id)
    }
    return id
}