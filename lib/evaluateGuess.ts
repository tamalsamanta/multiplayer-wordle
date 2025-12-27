export function evaluateGuess(guessPlayer: string, targetPlayer: string) {
    const guess = guessPlayer.toUpperCase()
    const target = targetPlayer.toUpperCase()
    const result = Array(5).fill('absent')
    const targetArr = target.split('')

    for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
            result[i] = 'correct'
            targetArr[i] = ''
        }
    }

    for (let i = 0; i < 5; i++) {
        if (result[i] === 'correct') continue
        const idx = targetArr.indexOf(guess[i])
        if (idx !== -1) {
            result[i] = 'present'
            targetArr[idx] = ''
        }
    }

    return result
}