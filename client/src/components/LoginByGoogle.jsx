import React from 'react'
import { FaUserShield } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'

const LoginByGoogle = () => {

    return (
        <div className='p-4 overflow-auto'>
            <div className="titleOfFeedback flex items-center sujoy1 gap-3 text-4xl font-bold pb-6 lg:text-4xl">
                <FaUserShield className="text-blue-500" />
                <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    authentication
                </p>
            </div>

            <div className='bodyOfAuthentication'>
                <button
                    onClick={() => {
                        location.href = `${import.meta.env.VITE_FEEDBACK_BACKEND_URL}/oauth2/authorization/google`;
                    }}
                    className="w-full flex items-center cursor-pointer mt-4 justify-center gap-3 py-3 px-4 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
                >
                    <span className="bg-black/30 p-2 rounded-full">
                        <FcGoogle className="text-xl" />
                    </span>

                    <span className="text-base">
                        Continue with Google
                    </span>
                </button>
            </div>
        </div>
    )
}

export default LoginByGoogle