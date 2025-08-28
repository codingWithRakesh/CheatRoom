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
            'bg-amber-500'
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