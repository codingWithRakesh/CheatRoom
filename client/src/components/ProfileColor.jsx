import React from 'react'
import { FaUser } from 'react-icons/fa6'
import { RiRobot2Fill, RiRobot3Fill } from "react-icons/ri";

const ProfileColor = ({ userId }) => {
    // Function to generate a consistent color from userId
    const getColorFromUserId = (id) => {
        // Simple hash function to convert string to number
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Predefined color palette
        const colors = [
            'bg-yellow-500',
            'bg-red-500',
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-teal-500',
            'bg-orange-500',
            'bg-amber-500',
            'bg-gray-500',
            'bg-stone-500',
            'bg-slate-500',
            'bg-zinc-500',
            'bg-neutral-500',
            'bg-cyan-500',
            'bg-lime-500',
            'bg-emerald-500',
            'bg-violet-500',
            'bg-fuchsia-500',
            'bg-rose-500',
            'bg-yellow-400',
            'bg-red-400',
            'bg-blue-400',
            'bg-green-400',
            'bg-purple-400',
            'bg-pink-400',
            'bg-indigo-400',
            'bg-teal-400',
            'bg-orange-400',
            'bg-amber-400',
            'bg-gray-400',
            'bg-stone-400',
            'bg-slate-400',
            'bg-zinc-400',
            'bg-neutral-400',
            'bg-cyan-400',
            'bg-lime-400',
            'bg-emerald-400',
            'bg-violet-400',
            'bg-fuchsia-400',
            'bg-rose-400',
            'bg-yellow-600',
            'bg-red-600',
            'bg-blue-600',
            'bg-green-600',
            'bg-purple-600',
            'bg-pink-600',
            'bg-indigo-600',
            'bg-teal-600',
            'bg-orange-600',
            'bg-amber-600',
            'bg-gray-600',
            'bg-stone-600',
            'bg-slate-600',
            'bg-zinc-600',
            'bg-neutral-600',
            'bg-cyan-600',
            'bg-lime-600',
            'bg-emerald-600',
            'bg-violet-600',
            'bg-fuchsia-600',
            'bg-rose-600',
            'bg-yellow-300',
            'bg-red-300',
            'bg-blue-300',
            'bg-green-300',
            'bg-purple-300',
            'bg-pink-300',
            'bg-indigo-300',
            'bg-teal-300',
            'bg-orange-300',
            'bg-amber-300',
            'bg-gray-300',
            'bg-stone-300',
            'bg-slate-300',
            'bg-zinc-300',
            'bg-neutral-300',
            'bg-cyan-300',
            'bg-lime-300',
            'bg-emerald-300',
            'bg-violet-300',
            'bg-fuchsia-300',
            'bg-rose-300',
        ];

        // Use the hash to select a color from the palette
        const colorIndex = Math.abs(hash) % colors.length;
        return colors[colorIndex];
    };

    const colorClass = userId ? getColorFromUserId(userId) : 'bg-gray-600';

    return (
        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center ${colorClass}`}>
            {userId != "ai" ? <FaUser /> : <RiRobot2Fill />}
        </div>
    )
}

export default ProfileColor