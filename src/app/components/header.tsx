import React from 'react'
import Link from 'next/link'

function Header() {
  return (
    <header className='bg-white border-b border-gray-200'>
        <nav className='max-w-7xl mx-auto px-6 py-4'>
            <Link href="/" className='text-gray-900 hover:text-gray-600 font-light text-xl transition-colors'>
                Weather App
            </Link>
        </nav>
    </header>
  )
}

export default Header