import React from 'react'
import Image from 'next/image'
import logoImage from '@/image/logo.png'

const Logo = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Image
        src={logoImage}
        alt="MyJalako Logo"
        width={size === 'small' ? 32 : size === 'default' ? 48 : size === 'large' ? 64 : 80}
        height={size === 'small' ? 32 : size === 'default' ? 48 : size === 'large' ? 64 : 80}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export default Logo
