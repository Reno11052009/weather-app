import React from 'react'
import Link from 'next/link'

function Header() {
  return (
    <header className='bg-white border-b border-gray-200'>
        <nav className='max-w-7xl mx-auto px-6 py-4'>
            <Link href="/" className='text-black hover:text-gray-600 text-2xl transition-colors font-semibold'>
                Weather App
            </Link>
        </nav>
    </header>
  )
}

export default Header