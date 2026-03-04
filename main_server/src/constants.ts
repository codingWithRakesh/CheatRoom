export const DB_NAME = "cheatRoom"
export const options : { 
    httpOnly: boolean; 
    secure: boolean; 
    sameSite: 'none' | 'lax' | 'strict' 
} = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
}