export const DB_NAME = "cheatRoom"
export const options : { 
    httpOnly: boolean; 
    secure: boolean; 
    sameSite: 'None' | 'Lax' | 'Strict' 
} = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
}