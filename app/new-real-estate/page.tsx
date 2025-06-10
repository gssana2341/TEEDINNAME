import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Real Estate - Tedin Easy',
  description: 'Discover new real estate opportunities',
}

export default function NewRealEstatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">New Real Estate</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New property listings will go here */}
        <p>New real estate listings will be displayed here.</p>
      </div>
    </div>
  )
}
