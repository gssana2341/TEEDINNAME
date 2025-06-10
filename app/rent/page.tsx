import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rent Properties - Tedin Easy',
  description: 'Find rental properties with Tedin Easy',
}

export default function RentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Properties for Rent</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property listings will go here */}
        <p>Rental properties will be displayed here.</p>
      </div>
    </div>
  )
}
